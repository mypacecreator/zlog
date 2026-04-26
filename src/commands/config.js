const { readConfig, writeConfig } = require('../utils/config');

const ALLOWED_KEYS = ['model', 'api_key'];
const KEY_MAP = { api_key: 'apiKey', model: 'model' };

function handleConfigList() {
  const cfg = readConfig();
  console.log('model   :', cfg.model);
  console.log('api_key :', cfg.apiKey ? cfg.apiKey.slice(0, 8) + '...' : '(未設定)');
}

function handleConfigSet(key, value) {
  if (!ALLOWED_KEYS.includes(key)) {
    console.error(`エラー: 不明なキー "${key}"。使用可能: ${ALLOWED_KEYS.join(', ')}`);
    process.exit(1);
  }
  const cfg = readConfig();
  cfg[KEY_MAP[key]] = value;
  writeConfig(cfg);
  const display = key === 'api_key' ? value.slice(0, 8) + '...' : value;
  console.log(`設定しました: ${key} = ${display}`);
}

function handleConfigGet(key) {
  if (!ALLOWED_KEYS.includes(key)) {
    console.error(`エラー: 不明なキー "${key}"。使用可能: ${ALLOWED_KEYS.join(', ')}`);
    process.exit(1);
  }
  const cfg = readConfig();
  const val = cfg[KEY_MAP[key]];
  if (key === 'api_key') {
    console.log(val ? val.slice(0, 8) + '...' : '(未設定)');
  } else {
    console.log(val || '(未設定)');
  }
}

module.exports = { handleConfigList, handleConfigSet, handleConfigGet };
