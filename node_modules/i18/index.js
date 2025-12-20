'use strict';

const path = require('path');
const Command = require('common-bin');

class I18Command extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: i18 <command> [options]';

    // load sub command
    this.load(path.join(__dirname, 'lib/command'));
  }
}

module.exports = I18Command;
