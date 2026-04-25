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
 * HH:MM形式の妥当性チェック
 * @param {string} timeStr - チェックする時刻文字列
 * @returns {boolean} 妥当であればtrue
 */
function parseTimeString(timeStr) {
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeStr);
}

module.exports = {
  getCurrentTime,
  getCurrentDate,
  parseTimeString,
};
