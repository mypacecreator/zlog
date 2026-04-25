const { getCurrentTime, getCurrentDate } = require('../utils/time');
const { getUnfinishedLog, getLastFinishedLog, appendLog, updateLogs } = require('../utils/csv');

/**
 * パターン① 開始: 新タスクを開始
 * @param {string|null} specifiedTime - 指定時刻（HH:MM）またはnull
 * @param {string} project - 案件名
 * @param {string} task - 作業内容
 */
function handleStart(specifiedTime, project, task) {
  const currentDate = getCurrentDate();
  const startTime = specifiedTime || getCurrentTime();

  // 未終了タスクがあれば終了させる
  const unfinished = getUnfinishedLog();
  if (unfinished) {
    updateLogs(unfinished.index, startTime);
  }

  // 新タスクを開始（終了時刻は空）
  appendLog(currentDate, startTime, '', project, task);
}

/**
 * パターン② 終了: 未終了タスクを終了
 * @param {string|null} specifiedTime - 指定時刻（HH:MM）またはnull
 */
function handleEnd(specifiedTime) {
  const endTime = specifiedTime || getCurrentTime();

  // 未終了タスクを検索
  const unfinished = getUnfinishedLog();
  if (!unfinished) {
    console.error('エラー: 終了すべきタスクがありません');
    process.exit(1);
  }

  // 終了時刻を更新
  updateLogs(unfinished.index, endTime);
}

/**
 * パターン③ 連続: 前回の終了時刻から新タスクを実行
 * @param {string|null} specifiedTime - 指定時刻（HH:MM）またはnull
 * @param {string} project - 案件名
 * @param {string} task - 作業内容
 */
function handleContinue(specifiedTime, project, task) {
  // 未終了タスクがある場合はエラー
  const unfinished = getUnfinishedLog();
  if (unfinished) {
    console.error('エラー: 未終了の作業があります。先に終了処理を行ってください。');
    process.exit(1);
  }

  // 最後に完了したタスクを取得
  const lastFinished = getLastFinishedLog();
  if (!lastFinished) {
    console.error('エラー: 開始時刻を指定してください');
    process.exit(1);
  }

  const currentDate = getCurrentDate();
  const startTime = lastFinished.endTime;
  const endTime = specifiedTime || getCurrentTime();

  // 新タスクを追加（即座に完了）
  appendLog(currentDate, startTime, endTime, project, task);
}

module.exports = {
  handleStart,
  handleEnd,
  handleContinue,
};
