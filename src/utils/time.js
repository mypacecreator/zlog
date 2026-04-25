/**
 * 現在時刻をHH:MM形式で取得
 * @returns {string} HH:MM形式の時刻
 */
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 現在日付をYYYY-MM-DD形式で取得
 * @returns {string} YYYY-MM-DD形式の日付
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 時刻文字列のパースと正規化
 * @param {string} timeStr - チェックする時刻文字列（H:MM または HH:MM 形式）
 * @returns {string|null} 正規化されたHH:MM形式の時刻、不正な場合はnull
 */
function parseTimeString(timeStr) {
  const timeRegex = /^([0-9]{1,2}):([0-9]{1,2})$/;
  const match = timeStr.match(timeRegex);

  if (!match) {
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  // 妥当性チェック
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  // HH:MM形式に正規化（0埋め）
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

module.exports = {
  getCurrentTime,
  getCurrentDate,
  parseTimeString,
};
