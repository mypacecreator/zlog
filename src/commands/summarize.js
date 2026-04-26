const Anthropic = require('@anthropic-ai/sdk');
const { readAllLogs } = require('../utils/csv');
const { resolveTargetDate } = require('../utils/time');
const { getApiKey, getModel, getCategories, getPromptTemplate } = require('../utils/config');
const { appendToArchive, readArchiveSection } = require('../utils/archive');

function calcDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins >= 0 ? mins : 0;
}

function buildInputLines(logs) {
  return logs
    .map((log, i) => {
      const dur = calcDuration(log.startTime, log.endTime);
      return `${i + 1}. ${log.date},${log.startTime},${log.endTime},${log.project},${log.task},${dur}分`;
    })
    .join('\n');
}

function buildPrompt(logs, categories) {
  const inputLines = buildInputLines(logs);

  const system = [
    'あなたは業務ログの整理専門AIです。',
    'ルール（絶対厳守）:',
    `- 入力が ${logs.length} 件のとき、出力も必ず ${logs.length} 行のみ。`,
    '- 余計な説明・前置き・番号・マークダウン装飾は一切出力しない。',
    '- 各行のフォーマット（パイプ区切り）:',
    '  [YYYY-MM-DD] HH:MM-HH:MM | 案件名 | 作業内容 | カテゴリコード. 大カテゴリ｜小カテゴリ 絵文字 | 所要：○分',
    '  例: [2026-04-26] 09:50-10:05 | プロジェクトX | 要件定義 | A1. クライアントワーク 実作業 🛠️ | 所要：15分',
  ].join('\n');

  const user = `カテゴリ体系:\n${categories}\n\n以下のログを上記ルールに従って整形してください:\n${inputLines}`;

  return { system, user };
}

function applyCustomTemplate(template, logs, categories) {
  const inputLines = buildInputLines(logs);

  const filled = template
    .replaceAll('{CATEGORIES}', categories)
    .replaceAll('{LOGS}', inputLines);

  return {
    system: 'あなたは業務ログの整理専門AIです。指定されたフォーマットで出力してください。',
    user: filled,
  };
}

async function handleSummarize(options) {
  // 日付解決
  const date = resolveTargetDate(options.date);

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('エラー: Anthropic APIキーが設定されていません。');
    console.error('  zlog config set api_key YOUR_KEY');
    console.error('  または環境変数 ANTHROPIC_API_KEY を設定してください。');
    process.exit(1);
  }

  const allLogs = readAllLogs(date);
  const todayLogs = allLogs.filter((l) => l.date === date);

  if (todayLogs.length === 0) {
    console.error(`${date} のログが見つかりません。`);
    process.exit(1);
  }

  const incompleteLogs = todayLogs.filter((l) => !l.endTime);
  const completedLogs = todayLogs.filter((l) => l.endTime);

  if (incompleteLogs.length > 0) {
    console.warn('⚠️  未終了のタスクがあります（スキップ）:');
    incompleteLogs.forEach((l) =>
      console.warn(`   ${l.startTime}- ${l.project} ${l.task}`)
    );
  }

  if (completedLogs.length === 0) {
    console.error('完了済みのログがありません。');
    process.exit(1);
  }

  const categories = getCategories();
  const customTemplate = getPromptTemplate();
  const { system, user } = customTemplate
    ? applyCustomTemplate(customTemplate, completedLogs, categories)
    : buildPrompt(completedLogs, categories);

  const model = getModel();
  console.log(`AI処理中... (${model})`);

  const client = new Anthropic({ apiKey });
  let response;
  try {
    response = await client.messages.create({
      model,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    });
  } catch (err) {
    console.error('エラー: Anthropic API呼び出しに失敗しました。');
    console.error(err.message);
    process.exit(1);
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    console.error('エラー: AIからテキスト応答が得られませんでした。');
    process.exit(1);
  }
  const rawOutput = textBlock.text.trim();
  const outputLines = rawOutput.split('\n').map((l) => l.trim()).filter(Boolean);

  if (outputLines.length !== completedLogs.length) {
    console.warn(
      `⚠️  AIの出力行数（${outputLines.length}）が入力件数（${completedLogs.length}）と一致しません。`
    );
  }

  appendToArchive(date, outputLines);

  const section = readArchiveSection(date);
  console.log('\n' + section);
}

module.exports = { handleSummarize };
