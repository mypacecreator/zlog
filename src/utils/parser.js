const { parseTimeString, parseDateString } = require('./time');

/**
 * コマンドライン引数をパースして3つのモードを判定
 * @param {string[]} args - process.argv.slice(2)
 * @returns {Object} { mode: 'START'|'END'|'CONTINUE', date: string|null, time: string|null, project: string|null, task: string|null }
 */
function parseArgs(args) {
  if (args.length === 0) {
    console.error('エラー: 引数が不足しています');
    process.exit(1);
  }

  let date = null;
  let time = null;
  let startIndex = 0;

  // 第一引数が日付指定かチェック（正規化された日付を取得）
  const parsedDate = parseDateString(args[0]);
  if (parsedDate) {
    date = parsedDate;  // 正規化された日付（YYYY-MM-DD形式）
    startIndex = 1;
  }

  // 次の引数（または第一引数）が時刻指定かチェック
  if (startIndex < args.length) {
    const parsedTime = parseTimeString(args[startIndex]);
    if (parsedTime) {
      time = parsedTime;  // 正規化された時刻（HH:MM形式）
      startIndex++;
    }
  }

  // 残りの引数を結合
  const remainingArgs = args.slice(startIndex).join(' ').trim();

  if (!remainingArgs) {
    console.error('エラー: 引数が不足しています');
    process.exit(1);
  }

  // パターン② 終了: / のみ
  if (remainingArgs === '/') {
    return { mode: 'END', date, time, project: null, task: null };
  }

  // パターン③ 連続: / で始まり、その後にデリミタと内容がある
  if (remainingArgs.startsWith('/ ')) {
    const content = remainingArgs.substring(2).trim();
    return parseContent(content, 'CONTINUE', date, time);
  }

  // パターン① 開始: デリミタで案件と作業内容を分割
  return parseContent(remainingArgs, 'START', date, time);
}

/**
 * デリミタで分割して案件名と作業内容を取得
 * @param {string} content - パース対象の文字列
 * @param {string} mode - 'START' または 'CONTINUE'
 * @param {string|null} date - 日付指定
 * @param {string|null} time - 時刻指定
 * @returns {Object} { mode, date, time, project, task }
 */
function parseContent(content, mode, date, time) {
  // :（半角コロン）をメインデリミタとし、全角：や｜も代替として受け付ける
  const delimiterRegex = /\s*[:：｜]\s*/;
  // 最初のデリミタだけで分割（最大2つに分割）
  const parts = content.split(delimiterRegex, 2);

  // デリミタがない場合は、案件名を空、全体を作業内容とする
  if (parts.length < 2 || !parts[1]) {
    return {
      mode,
      date,
      time,
      project: '',
      task: content.trim(),
    };
  }

  // デリミタはあるが案件名が空の場合はエラー
  if (!parts[0]) {
    console.error('エラー: 案件名が空です');
    console.error('');
    console.error('使い方:');
    console.error('  zlog 案件名:作業内容     ← 案件名と作業内容を記録');
    console.error('  zlog 作業内容のみ        ← 作業内容のみ記録（案件名省略）');
    process.exit(1);
  }

  return {
    mode,
    date,
    time,
    project: parts[0].trim(),
    task: parts[1].trim(),
  };
}

module.exports = {
  parseArgs,
};
