const { resolveTargetDate } = require('../utils/time');
const { getArchiveLines, updateArchiveLine } = require('../utils/archive');
const { parseCategoryLabel } = require('../utils/config');

async function handleFix(options, lineNum, categoryCode) {
  const date = resolveTargetDate(options.date);
  const lines = getArchiveLines(date);

  if (lines.length === 0) {
    console.error(`${date} のアーカイブが見つかりません。先に \`zlog summarize\` を実行してください。`);
    process.exit(1);
  }

  if (!lineNum) {
    lines.forEach((line, i) => console.log(`${i + 1}. ${line.trim()}`));
    return;
  }

  const idx = parseInt(lineNum, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= lines.length) {
    console.error(`エラー: 行番号 ${lineNum} は範囲外です（1〜${lines.length}）。`);
    process.exit(1);
  }

  if (!categoryCode) {
    console.error('エラー: カテゴリコードを指定してください（例: A1, B4）。');
    process.exit(1);
  }

  const newLabel = parseCategoryLabel(categoryCode.toUpperCase());
  if (!newLabel) {
    console.error(`エラー: カテゴリコード "${categoryCode}" が見つかりません。`);
    process.exit(1);
  }

  const fields = lines[idx].split('|');
  const oldLabel = fields[3]?.trim() ?? '';

  updateArchiveLine(date, idx, newLabel);
  console.log(`✓ ${lineNum}件目のカテゴリを変更しました: ${oldLabel} → ${newLabel}`);
}

module.exports = { handleFix };
