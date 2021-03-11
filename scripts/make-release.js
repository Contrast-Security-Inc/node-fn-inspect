#!/usr/bin/env node
'use strict';
const yargsInteractive = require('yargs-interactive');
const cp = require('child_process');
const fs = require('fs');
const options = {
  interactive: { default: true },
  releaseType: {
    type: 'list',
    describe: 'What kind of release do you want to make?',
    choices: ['patch', 'minor', 'major']
  }
};

yargsInteractive()
  .usage('$0 [args]')
  .interactive(options)
  .then(({ releaseType }) => {
    if (fs.existsSync('funcinfo.tgz.zip')) {
      cp.execSync(`${__dirname}/npm-publish.sh ${releaseType}`, {
        stdio: 'inherit'
      });
    } else {
      throw new Error('funcinfo.tgz.zip not found');
    }
    return releaseType;
  })
  .then((releaseType) => {
    // Only bump version in local checkout if publishing artifact is successful
    cp.exec(`npm version ${releaseType}`);
  })
  .catch((err) => {
    console.log('Publishing failed:');
    console.log(err);
    process.exit(-1);
  });
  