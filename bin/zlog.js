#!/usr/bin/env node

const { program } = require('commander');
const { parseArgs } = require('../src/utils/parser');
const { handleStart, handleEnd, handleContinue } = require('../src/commands/log');
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .description('超軽量・高速ロギングCLIツール')
  .allowUnknownOption()
  .allowExcessArguments()
  .action(() => {
    const args = process.argv.slice(2);

    // --version, --help 以外の引数を処理
    if (args.length === 0 || args[0].startsWith('-')) {
      return;
    }

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
