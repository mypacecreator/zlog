const fs = require('fs');
const path = require('path');
const { ARCHIVES_DIR } = require('../constants');

function ensureArchivesDir() {
  if (!fs.existsSync(ARCHIVES_DIR)) fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
}

function getArchiveFilePath(date) {
  return path.join(ARCHIVES_DIR, `${date.substring(0, 7)}.md`);
}

function appendToArchive(date, lines) {
  ensureArchivesDir();
  const filePath = getArchiveFilePath(date);
  const heading = `## ${date}: 実績報告`;

  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

  if (!content.includes(heading)) {
    const prefix = content && !content.endsWith('\n\n')
      ? (content.endsWith('\n') ? '\n' : '\n\n')
      : '';
    content += `${prefix}${heading}\n`;
  }

  const existingLines = new Set(content.split('\n'));
  const newLines = lines.filter((l) => !existingLines.has(l));

  if (newLines.length === 0) {
    console.warn('アーカイブに既に同じ内容が存在します（スキップ）');
    return;
  }

  // セクション末尾（次の見出し直前）に挿入
  const sectionStart = content.indexOf(heading);
  const sectionRest = content.slice(sectionStart);
  const nextHeadingOffset = sectionRest.indexOf('\n## ', 1);
  const insertPos = nextHeadingOffset === -1
    ? content.length
    : sectionStart + nextHeadingOffset + 1;

  const insertedLines = newLines.map((l) => `${l}\n`).join('');
  content = `${content.slice(0, insertPos)}${insertedLines}${content.slice(insertPos)}`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readArchiveSection(date) {
  const filePath = getArchiveFilePath(date);
  if (!fs.existsSync(filePath)) return '';
  const heading = `## ${date}: 実績報告`;
  const content = fs.readFileSync(filePath, 'utf-8');
  const start = content.indexOf(heading);
  if (start === -1) return '';
  const rest = content.slice(start);
  const nextHeading = rest.indexOf('\n## ', 1);
  return nextHeading === -1 ? rest.trimEnd() : rest.slice(0, nextHeading).trimEnd();
}

module.exports = { appendToArchive, readArchiveSection };
