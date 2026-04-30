const { readAllLogs } = require('../utils/csv');
const { resolveTargetDate } = require('../utils/time');
const { readArchiveSection, parseArchiveLine } = require('../utils/archive');

async function handleList(options) {
  const date = resolveTargetDate(options.date);
  const allLogs = readAllLogs(date);
  const targetDateLogs = allLogs.filter((l) => l.date === date);

  let filteredLogs = targetDateLogs;

  if (options.category) {
    const categoryPrefix = options.category.toUpperCase();
    const archiveSection = readArchiveSection(date);

    if (!archiveSection) {
      console.error(`${date} のアーカイブが見つかりません。先に \`zlog summarize\` を実行してください。`);
      process.exitCode = 1;
      return;
    }

    const matchedKeys = new Set(
      archiveSection
        .split('\n')
        .map(parseArchiveLine)
        .filter((e) => e && e.categoryCode.startsWith(categoryPrefix))
        .map((e) => `${e.date}|${e.startTime}|${e.endTime}`)
    );

    filteredLogs = targetDateLogs.filter((l) =>
      matchedKeys.has(`${l.date}|${l.startTime}|${l.endTime}`)
    );
  }

  if (filteredLogs.length === 0) {
    console.error(`${date} の該当ログが見つかりません。`);
    process.exitCode = 1;
    return;
  }

  const label = options.category ? ` [カテゴリ: ${options.category.toUpperCase()}]` : '';
  console.error(`\n${date}のログ${label} (${filteredLogs.length}件)\n`);

  filteredLogs.forEach((log) => {
    console.log(log.rawLine);
  });

  console.error('');
}

module.exports = { handleList };
