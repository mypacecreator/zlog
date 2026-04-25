const fs = require('fs');
const { ZLOG_DIR, LOG_FILE } = require('../constants');

/**
 * ~/zlog ディレクトリの自動作成
 */
function ensureZlogDirectory() {
  if (!fs.existsSync(ZLOG_DIR)) {
    fs.mkdirSync(ZLOG_DIR, { recursive: true });
  }
}

/**
 * 全ログの読み込み
 * @returns {Array} ログの配列（各要素は { date, startTime, endTime, project, task, rawLine } ）
 */
function readAllLogs() {
  ensureZlogDirectory();

  if (!fs.existsSync(LOG_FILE)) {
    return [];
  }

  const content = fs.readFileSync(LOG_FILE, 'utf-8').trim();
  if (!content) {
    return [];
  }

  return content.split('\n').map((line) => {
    const parts = line.split(',');
    return {
      date: parts[0] || '',
      startTime: parts[1] || '',
      endTime: parts[2] || '',
      project: parts[3] || '',
      task: parts[4] || '',
      rawLine: line,
    };
  });
}

/**
 * 未終了ログの検索（全日付から）
 * @returns {Object|null} 未終了ログまたはnull
 */
function getUnfinishedLog() {
  const logs = readAllLogs();
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].endTime === '') {
      return { log: logs[i], index: i };
    }
  }
  return null;
}

/**
 * 最後に完了したログの取得（全日付から）
 * @returns {Object|null} 完了済みログまたはnull
 */
function getLastFinishedLog() {
  const logs = readAllLogs();
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].endTime !== '') {
      return logs[i];
    }
  }
  return null;
}

/**
 * ログの追記
 * @param {string} date - 日付（YYYY-MM-DD）
 * @param {string} startTime - 開始時刻（HH:MM）
 * @param {string} endTime - 終了時刻（HH:MM or 空文字列）
 * @param {string} project - 案件名
 * @param {string} task - 作業内容
 */
function appendLog(date, startTime, endTime, project, task) {
  ensureZlogDirectory();
  const line = `${date},${startTime},${endTime},${project},${task}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

/**
 * ログの更新（特定行の終了時刻を更新）
 * @param {number} index - 更新する行のインデックス
 * @param {string} endTime - 新しい終了時刻
 */
function updateLogs(index, endTime) {
  const logs = readAllLogs();
  if (index < 0 || index >= logs.length) {
    console.error('エラー: 更新対象のログが見つかりません');
    process.exit(1);
  }

  logs[index].endTime = endTime;
  const updatedContent = logs
    .map((log) => `${log.date},${log.startTime},${log.endTime},${log.project},${log.task}`)
    .join('\n') + '\n';

  fs.writeFileSync(LOG_FILE, updatedContent, 'utf-8');
}

module.exports = {
  ensureZlogDirectory,
  readAllLogs,
  getUnfinishedLog,
  getLastFinishedLog,
  appendLog,
  updateLogs,
};
