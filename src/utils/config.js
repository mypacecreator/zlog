const fs = require('fs');
const path = require('path');
const { CONFIG_FILE, CONFIG_DIR } = require('../constants');

const DEFAULTS = {
  model: 'claude-haiku-4-5',
  apiKey: '',
};

const DEFAULT_CATEGORIES = `## カテゴリ体系

## A. クライアントワーク
- A1. 実作業 🛠️（制作・実装・成果物作成）
- A2. コミュニケーション 💬（チャット・メール・進行管理・報告など）
- A3. コンサルティング／打合せ 🧭（提案・助言・会議・ヒアリングなど、会話そのものが価値となる業務）
- A4. 調査・検証 🔎（クライアント案件に直接関係する調査・技術検証・動作確認など）
- A5. 見積対応 💹 （見積作成や工数算出に直接関係する調査等）
- A6. 指示出し☝️（外注パートナー等への依頼作成作業等）

## B. 自社タスク
- B1. 事務系 📑（経理・契約・請求書・事務連絡など）
- B2. コンテンツ作成 ✍️（記事執筆・ポッドキャスト収録・資料作成など）
- B3. 作業環境整備 ⚙️（PC環境整備・ツール導入・ワークフロー改善など）
- B4. 情報インプット 📚（勉強・リサーチ・他社分析・新技術の試行など）

## C. 社会的活動（Public Work）
- C1. 登壇・講師 🎤（セミナー登壇・講座講師・講演など）
- C2. 公的支援・窓口対応 🏛️（中小企業診断士としての公的機関相談対応・専門支援など）
- C3. OSSコミット 🌍（OSSやコミュニティへの貢献活動）

## D. プライベート（実働時間に含めない）
- D1. 私用・生活関連 🏡（送迎・家事・私用外出など）
- D2. 休憩 ☕（食事・仮眠・休憩など）

## E. その他
- E0. その他 ❓（分類できないもの）`;

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
