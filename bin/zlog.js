#!/usr/bin/env node

const { program } = require('commander');
const { parseArgs } = require('../src/utils/parser');
const { handleStart, handleEnd, handleContinue } = require('../src/commands/log');
const { handleSummarize } = require('../src/commands/summarize');
const { handleList } = require('../src/commands/list');
const { handleConfigList, handleConfigSet, handleConfigGet } = require('../src/commands/config');
const packageJson = require('../package.json');

// --- Subcommand: summarize (alias: s) ---
program
  .command('summarize')
  .alias('s')
  .description('今日のログをAIで整理してアーカイブに保存')
  .option('-d, --date <date>', '対象日付（YYYY-MM-DD）、省略時は今日')
  .action((options) => {
    handleSummarize(options).catch((err) => {
      console.error('エラー:', err.message);
      process.exit(1);
    });
  });

// --- Subcommand: list (alias: l) ---
program
  .command('list')
  .alias('l')
  .description('当日または指定日のログ一覧を表示')
  .option('-d, --date <date>', '対象日付(YYYY-MM-DD)、省略時は今日')
  .action((options) => {
    handleList(options).catch((err) => {
      console.error('エラー:', err.message);
      process.exit(1);
    });
  });

// --- Subcommand: config ---
const configCmd = program
  .command('config')
  .description('設定の管理');

configCmd
  .command('list')
  .description('全設定を表示')
  .action(() => handleConfigList());

configCmd
  .command('set <key> <value>')
  .description('設定値を変更 (model, api_key)')
  .action((key, value) => handleConfigSet(key, value));

configCmd
  .command('get <key>')
  .description('設定値を取得 (model, api_key)')
  .action((key) => handleConfigGet(key));

// --- Default action (Step 1) ---
program
  .version(packageJson.version)
  .description('超軽量・高速ロギングCLIツール')
  .allowUnknownOption()
  .allowExcessArguments()
  .action(() => {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0].startsWith('-')) {
      return;
    }

    // サブコマンドはここでは処理しない（commanderが既にルーティング済み）
    const subcommands = ['summarize', 's', 'list', 'l', 'config'];
    if (subcommands.includes(args[0])) return;

    const parsed = parseArgs(args);

    switch (parsed.mode) {
      case 'START':
        handleStart(parsed.date, parsed.time, parsed.project, parsed.task);
        break;
      case 'END':
        handleEnd(parsed.date, parsed.time);
        break;
      case 'CONTINUE':
        handleContinue(parsed.date, parsed.time, parsed.project, parsed.task);
        break;
      default:
        console.error('エラー: 不明なモード');
        process.exit(1);
    }
  });

program.parse(process.argv);
