const { readAllLogs } = require('../utils/csv');
const { getCurrentDate, parseDateString } = require('../utils/time');

async function handleList(options) {
  // 日付パース
  let date;
  if (options.date) {
    date = parseDateString(options.date);
    if (!date) {
      console.error(`エラー: 無効な日付形式です "${options.date}"。YYYY-MM-DD 形式で指定してください。`);
      process.exit(1);
    }
  } else {
    date = getCurrentDate();
  }

  // ログ読み込み
  const allLogs = readAllLogs(date);
  const targetDateLogs = allLogs.filter((l) => l.date === date);

  if (targetDateLogs.length === 0) {
    console.error(`${date} のログが見つかりません。`);
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
