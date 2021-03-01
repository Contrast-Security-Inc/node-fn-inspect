#!/usr/bin/env node
'use strict';
const yargsInteractive = require('yargs-interactive');
const cp = require('child_process');
const os = require('os');
const fs = require('fs');
const pa = require('path');

const options = {
  interactive: { default: true },
  releaseType: {
    type: 'list',
    describe: 'What kind of release do you want to make?',
    choices: ['patch', 'minor', 'major']
  },
  funcinfoPath: {
    type: 'input',
    describe: 'What directory is funcinfo.tgz.zip in?'
  }
};

yargsInteractive()
  .usage('$0 [args]')
  .interactive(options)
  .then(({ releaseType, funcinfoPath }) => {
    funcinfoPath =
      funcinfoPath[0] === '~' ? funcinfoPath.substring(2) : funcinfoPath;
    const path = pa.resolve(os.homedir(), funcinfoPath);

    if (fs.existsSync(`${path}/funcinfo.tgz.zip`)) {
      cp.execSync(`${__dirname}/npm-publish.sh ${releaseType} ${path}`, {
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
  });
