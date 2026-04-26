const { getCurrentTime, getCurrentDate } = require('../utils/time');
const { getUnfinishedLog, getLastFinishedLog, appendLog, updateLogs } = require('../utils/csv');
const { getYearMonth } = require('../constants');

/**
 * パターン① 開始: 新タスクを開始
 * @param {string|null} specifiedDate - 指定日付（YYYY-MM-DD）またはnull
 * @param {string|null} specifiedTime - 指定時刻（HH:MM）またはnull
 * @param {string} project - 案件名
 * @param {string} task - 作業内容
 */
function handleStart(specifiedDate, specifiedTime, project, task) {
  const targetDate = specifiedDate || getCurrentDate();
  const startTime = specifiedTime || getCurrentTime();

  // 未終了タスクがあれば終了させる（当月のみチェック）
  const unfinished = getUnfinishedLog(targetDate);
  if (unfinished) {
    // 日付が異なる場合はエラー（同日のみ自動終了可能）
    if (unfinished.log.date !== targetDate) {
      console.error('エラー: 未終了タスクの日付が異なります');
      console.error(`未終了タスク: ${unfinished.log.date} ${unfinished.log.startTime}- ${unfinished.log.project}:${unfinished.log.task}`);
      console.error(`新規タスク: ${targetDate}`);
      console.error('');
      console.error('未終了タスクを先に終了してください:');
      console.error(`  zlog ${unfinished.log.date} HH:MM /`);
      process.exit(1);
    }

    updateLogs(targetDate, unfinished.index, startTime);
  }

  // 新タスクを開始（終了時刻は空）
  appendLog(targetDate, startTime, '', project, task);
}

/**
 * パターン② 終了: 未終了タスクを終了
 * @param {string|null} specifiedDate - 指定日付（YYYY-MM-DD）またはnull
 * @param {string|null} specifiedTime - 指定時刻（HH:MM）またはnull
 */
function handleEnd(specifiedDate, specifiedTime) {
  const targetDate = specifiedDate || getCurrentDate();
  const endTime = specifiedTime || getCurrentTime();

  // 未終了タスクを検索（当月のみ）
  const unfinished = getUnfinishedLog(targetDate);
  if (!unfinished) {
    console.error('エラー: 終了すべきタスクがありません（当月のみ検索）');
    console.error('');
    console.error('前月の未終了タスクを終了する場合は、日付を指定してください:');
    console.error('  zlog YYYY-MM-DD HH:MM /');
    process.exit(1);
  }

  // 終了時刻を更新
  updateLogs(unfinished.log.date, unfinished.index, endTime);
}

/**
 * パターン③ 連続: 前回の終了時刻から新タスクを実行
 * @param {string|null} specifiedDate - 指定日付（YYYY-MM-DD）またはnull
 * @param {string|null} specifiedTime - 指定時刻（HH:MM）またはnull
 * @param {string} project - 案件名
 * @param {string} task - 作業内容
 */
function handleContinue(specifiedDate, specifiedTime, project, task) {
  const targetDate = specifiedDate || getCurrentDate();

  // 未終了タスクがある場合はエラー（当月のみチェック）
  const unfinished = getUnfinishedLog(targetDate);
  if (unfinished) {
    console.error('エラー: 未終了の作業があります。先に終了処理を行ってください。');
    process.exit(1);
  }

  // 最後に完了したタスクを取得（当月のみ）
  const lastFinished = getLastFinishedLog(targetDate);
  if (!lastFinished) {
    console.error('エラー: 連続実行できる前回タスクがありません（当月のみ検索）');
    console.error('');
    console.error('前月のタスクから連続実行することはできません。');
    console.error('開始時刻を明示的に指定してください:');
    console.error('  zlog HH:MM 案件:作業');
    process.exit(1);
  }

  // 月またぎチェック
  const lastFinishedMonth = getYearMonth(lastFinished.date);
  const targetMonth = getYearMonth(targetDate);

  if (lastFinishedMonth !== targetMonth) {
    console.error(`エラー: 連続実行では月またぎはできません`);
    console.error(`前回タスクの日付: ${lastFinished.date}`);
    console.error(`対象の日付: ${targetDate}`);
    console.error('');
    console.error('月をまたぐ場合は、開始時刻を明示的に指定してください:');
    console.error(`  zlog ${targetDate} HH:MM 案件:作業`);
    process.exit(1);
  }

  // 日付チェック: 指定された日付と前回タスクの日付が異なる場合はエラー
  if (specifiedDate && lastFinished.date !== targetDate) {
    console.error(`エラー: 連続実行では日付またぎはできません`);
    console.error(`前回タスクの日付: ${lastFinished.date}`);
    console.error(`指定された日付: ${targetDate}`);
    console.error('');
    console.error('日付をまたぐ場合は、別々に記録してください:');
    console.error(`  zlog ${lastFinished.date} ${lastFinished.endTime} 案件:作業`);
    console.error(`  zlog ${lastFinished.date} 23:59 /`);
    console.error(`  zlog ${targetDate} 00:00 案件:作業`);
    process.exit(1);
  }

  const startTime = lastFinished.endTime;
  const endTime = specifiedTime || getCurrentTime();

  // 新タスクを追加（即座に完了）
  appendLog(targetDate, startTime, endTime, project, task);
}

module.exports = {
  handleStart,
  handleEnd,
  handleContinue,
};
