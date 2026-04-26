const { readAllLogs } = require('../utils/csv');
const { resolveTargetDate } = require('../utils/time');

async function handleList(options) {
  // 日付解決
  const date = resolveTargetDate(options.date);

  // ログ読み込み
  const allLogs = readAllLogs(date);
  const targetDateLogs = allLogs.filter((l) => l.date === date);

  if (targetDateLogs.length === 0) {
    console.error(`${date} のログが見つかりません。`);
    process.exitCode = 1;
    return;
  }

  // ヘッダー出力（stderrへ）
  console.error(`\n${date}のログ (${targetDateLogs.length}件)\n`);

  // CSV形式で出力（stdoutへ）
  targetDateLogs.forEach((log) => {
    console.log(log.rawLine);
  });

  console.error('');
}

module.exports = { handleList };
