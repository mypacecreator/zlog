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
 * 日付文字列のパースと妥当性チェック
 * @param {string} dateStr - チェックする日付文字列（YYYY-MM-DD形式）
 * @returns {string|null} 妥当な場合はそのまま返す、不正な場合はnull
 */
function parseDateString(dateStr) {
  const dateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = dateStr.match(dateRegex);

  if (!match) {
    return null;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  // 妥当性チェック
  if (year < 1900 || year > 2100) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }

  // YYYY-MM-DD形式に正規化（0埋め）
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

/**
 * オプションから対象日付を解決
 * @param {string|undefined} dateOption - 日付オプション（YYYY-MM-DD形式）、省略時は今日
 * @returns {string} YYYY-MM-DD形式の日付
 */
function resolveTargetDate(dateOption) {
  if (!dateOption) {
    return getCurrentDate();
  }

  const date = parseDateString(dateOption);
  if (!date) {
    console.error(`エラー: 無効な日付形式です "${dateOption}"。YYYY-MM-DD 形式で指定してください。`);
    process.exit(1);
  }

  return date;
}

module.exports = {
  getCurrentTime,
  getCurrentDate,
  parseTimeString,
  parseDateString,
  resolveTargetDate,
};
