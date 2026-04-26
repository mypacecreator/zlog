const path = require('path');
const fs = require('fs');

// プロジェクトルートを見つける（package.jsonがある場所）
function findProjectRoot() {
  let currentDir = __dirname;

  // 最大10階層まで親ディレクトリを探索
  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break; // ルートディレクトリに到達
    }
    currentDir = parentDir;
  }

  // 見つからない場合は__dirnameから2階層上をデフォルトとする
  return path.join(__dirname, '..', '..');
}

const PROJECT_ROOT = findProjectRoot();
const ZLOG_DIR = path.join(PROJECT_ROOT, 'logs');
const ARCHIVES_DIR = path.join(PROJECT_ROOT, 'archives');
const CONFIG_FILE = path.join(PROJECT_ROOT, 'config.json');
const CONFIG_DIR = path.join(PROJECT_ROOT, 'config');

/**
 * 日付から月ごとのログファイルパスを取得
 * @param {string} date - YYYY-MM-DD形式の日付
 * @returns {string} ログファイルのパス（YYYY-MM.csv）
 */
function getLogFilePath(date) {
  // YYYY-MM-DDからYYYY-MMを抽出
  const yearMonth = date.substring(0, 7); // 'YYYY-MM'
  return path.join(ZLOG_DIR, `${yearMonth}.csv`);
}

/**
 * 日付からYYYY-MM形式を取得
 * @param {string} date - YYYY-MM-DD形式の日付
 * @returns {string} YYYY-MM形式
 */
function getYearMonth(date) {
  return date.substring(0, 7);
}

module.exports = {
  PROJECT_ROOT,
  ZLOG_DIR,
  ARCHIVES_DIR,
  CONFIG_FILE,
  CONFIG_DIR,
  getLogFilePath,
  getYearMonth,
};
