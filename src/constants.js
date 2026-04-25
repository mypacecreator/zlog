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
const LOG_FILE = path.join(ZLOG_DIR, 'daily_log.csv');

module.exports = {
  ZLOG_DIR,
  LOG_FILE,
};
