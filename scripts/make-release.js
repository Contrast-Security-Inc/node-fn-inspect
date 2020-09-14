#!/usr/bin/env node
'use strict';
const yargsInteractive = require('yargs-interactive');
const cp = require('child_process');
const fs = require('fs');

const options = {
  interactive: { default: true },
  funcinfoPath: {
    type: 'input',
    describe: 'What directory is funcinfo.tgz.zip in?'
  }
};

yargsInteractive()
  .usage('$0 [args]')
  .interactive(options)
  .then(({ funcinfoPath }) => {
    if (fs.existsSync(`${__dirname}/../../${funcinfoPath}/funcinfo.tgz.zip`)) {
      cp.execSync(`${__dirname}/npm-publish.sh`);
    } else {
      console.log('funcinfo.tgz.zip not found');
    }
  })
  .catch((err) => {
    console.log('Publishing failed:');
    console.log(err);
  });
