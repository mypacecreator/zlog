const fs = require('fs');
const path = require('path');
const { CONFIG_FILE, CONFIG_DIR } = require('../constants');

const DEFAULTS = {
  model: 'claude-haiku-4-5',
  apiKey: '',
};

const DEFAULT_CATEGORIES = `## カテゴリ体系

### A: クライアントワーク
- A1: 打ち合わせ・ミーティング 💼
- A2: 提案・企画書作成 📋
- A3: 制作・実装 🔨
- A4: 確認・修正対応 🔧
- A5: 納品・リリース 🚀
- A6: その他クライアント対応 📞

### B: 自社業務
- B1: 社内ミーティング 🏢
- B2: 営業・提案活動 📈
- B3: 管理・経理・総務 📑
- B4: 自社開発・改善 ⚙️

### C: 社会・学習
- C1: 学習・研究 📚
- C2: 外部イベント・交流 🤝
- C3: 社会貢献・ボランティア 🌱

### D: 私用・休憩
- D1: 休憩・食事 ☕
- D2: 私用・雑務 🏠

### E: その他
- E0: 分類不能 ❓
`;

function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULTS };
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')));
  } catch (_) {
    return { ...DEFAULTS };
  }
}

function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2) + '\n', { encoding: 'utf-8', mode: 0o600 });
}

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY || readConfig().apiKey || null;
}

function getModel() {
  return readConfig().model || DEFAULTS.model;
}

function getCategories() {
  const catFile = path.join(CONFIG_DIR, 'categories.md');
  if (fs.existsSync(catFile)) return fs.readFileSync(catFile, 'utf-8');
  return DEFAULT_CATEGORIES;
}

function getPromptTemplate() {
  const tmplFile = path.join(CONFIG_DIR, 'prompt.md');
  if (fs.existsSync(tmplFile)) return fs.readFileSync(tmplFile, 'utf-8');
  return null;
}

module.exports = { readConfig, writeConfig, getApiKey, getModel, getCategories, getPromptTemplate };
