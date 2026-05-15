const fs = require('fs');
const path = require('path');
const { CONFIG_FILE, CONFIG_DIR } = require('../constants');

const DEFAULTS = {
  model: 'claude-haiku-4-5',
  apiKey: '',
};

const DEFAULT_CATEGORIES_JSON = {
  _groups: {
    A: 'クライアントワーク',
    B: '自社タスク',
    C: '社会的活動（Public Work）',
    D: 'プライベート（実働時間に含めない）',
    E: 'その他',
  },
  A1: { label: '実作業', emoji: '🛠️', description: '制作・実装・成果物作成', examples: ['コーディング', 'デザイン作成', '記事執筆（クライアント向け）', '動画編集'] },
  A2: { label: 'コミュニケーション', emoji: '💬', description: 'チャット・メール・進行管理・報告など', examples: ['Slackでの質問対応', '進捗報告メール', 'タスク管理更新'] },
  A3: { label: 'コンサルティング／打合せ', emoji: '🧭', description: '提案・助言・会議・ヒアリングなど、会話そのものが価値となる業務', examples: ['要件ヒアリング', '戦略提案MTG', '課題解決ディスカッション'] },
  A4: { label: '調査・検証', emoji: '🔎', description: 'クライアント案件に直接関係する調査・技術検証・動作確認など', examples: ['競合サービス調査', 'APIの動作確認', 'バグ原因調査'] },
  A5: { label: '見積対応', emoji: '💹', description: '見積作成や工数算出に直接関係する調査等', examples: ['工数見積もり', '料金表作成', '見積書送付'] },
  A6: { label: '指示出し', emoji: '☝️', description: '外注パートナー等への依頼作成作業等', examples: ['外注依頼書作成', '修正指示まとめ', 'パートナーへのブリーフィング'] },
  B1: { label: '事務系', emoji: '📑', description: '経理・契約・請求書・事務連絡など', examples: ['請求書作成', '契約書確認', '領収書整理'] },
  B2: { label: 'コンテンツ作成', emoji: '✍️', description: '記事執筆・ポッドキャスト収録・資料作成など（自社向け）', examples: ['ブログ記事執筆', 'ポッドキャスト収録', '登壇資料作成'] },
  B3: { label: '作業環境整備', emoji: '⚙️', description: 'PC環境整備・ツール導入・ワークフロー改善など', examples: ['開発環境構築', 'ツールの設定', '作業フロー見直し'] },
  B4: { label: '情報インプット', emoji: '📚', description: '勉強・リサーチ・他社分析・新技術の試行など', examples: ['技術書読書', '新しいフレームワークの試用', '業界動向調査'] },
  C1: { label: '登壇・講師', emoji: '🎤', description: 'セミナー登壇・講座講師・講演など', examples: ['勉強会での発表', 'オンライン講座の講師', 'カンファレンス登壇'] },
  C2: { label: '公的支援・窓口対応', emoji: '🏛️', description: '中小企業診断士としての公的機関相談対応・専門支援など', examples: ['よろず支援拠点での相談対応', '補助金申請サポート'] },
  C3: { label: 'OSSコミット', emoji: '🌍', description: 'OSSやコミュニティへの貢献活動', examples: ['OSSへのPR作成', 'コミュニティイベント運営', '技術情報の公開'] },
  D1: { label: '私用・生活関連', emoji: '🏡', description: '送迎・家事・私用外出など', examples: ['子供の送迎', '買い物', '通院'] },
  D2: { label: '休憩', emoji: '☕', description: '食事・仮眠・休憩など', examples: ['昼食', 'コーヒーブレイク', '仮眠'] },
  E0: { label: 'その他', emoji: '❓', description: '分類できないもの', examples: [] },
};

function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULTS };
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')));
  } catch (_) {
    return { ...DEFAULTS };
  }
}

function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2) + '\n', { encoding: 'utf-8', mode: 0o600 });
}

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY || readConfig().apiKey || null;
}

function getModel() {
  return readConfig().model || DEFAULTS.model;
}

function getCategoriesJson() {
  const jsonFile = path.join(CONFIG_DIR, 'categories.json');
  if (fs.existsSync(jsonFile)) {
    try {
      return JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    } catch (_) {
      return DEFAULT_CATEGORIES_JSON;
    }
  }
  return DEFAULT_CATEGORIES_JSON;
}

function getCategories() {
  // categories.md が残っている場合はそちらを優先（後方互換）
  const mdFile = path.join(CONFIG_DIR, 'categories.md');
  if (fs.existsSync(mdFile)) return fs.readFileSync(mdFile, 'utf-8');

  // categories.json からAI向けマークダウンを生成
  const json = getCategoriesJson();
  const { _groups, ...subcategories } = json;

  const grouped = {};
  for (const [code, cat] of Object.entries(subcategories)) {
    const major = code[0];
    if (!grouped[major]) grouped[major] = [];
    grouped[major].push({ code, ...cat });
  }

  const lines = ['## カテゴリ体系'];
  for (const [major, groupLabel] of Object.entries(_groups)) {
    lines.push('');
    lines.push(`## ${major}. ${groupLabel}`);
    for (const cat of (grouped[major] || [])) {
      const exStr = cat.examples.length > 0 ? `（例: ${cat.examples.join('、')}）` : '';
      lines.push(`- ${cat.code}. ${cat.label} ${cat.emoji}: ${cat.description}${exStr}`);
    }
  }
  return lines.join('\n');
}

function parseCategoryLabel(code) {
  const json = getCategoriesJson();
  const cat = json[code];
  if (cat) return `${code}. ${cat.label} ${cat.emoji}`;
  return null;
}

function getPromptTemplate() {
  const tmplFile = path.join(CONFIG_DIR, 'prompt.md');
  if (fs.existsSync(tmplFile)) return fs.readFileSync(tmplFile, 'utf-8');
  return null;
}

module.exports = { readConfig, writeConfig, getApiKey, getModel, getCategoriesJson, getCategories, parseCategoryLabel, getPromptTemplate };
