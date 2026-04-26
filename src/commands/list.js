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
  const todayLogs = allLogs.filter((l) => l.date === date);

  if (todayLogs.length === 0) {
    console.log(`${date} のログが見つかりません。`);
    return;
  }

  // ヘッダー出力
  console.log(`\n${date}のログ (${todayLogs.length}件)\n`);

  // CSV形式で出力
  todayLogs.forEach((log) => {
    console.log(log.rawLine);
  });

  console.log('');
}

module.exports = { handleList };
