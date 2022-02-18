#!/usr/bin/env node
'use strict';

const inquirer = require('inquirer');
const cp = require('child_process');
const fs = require('fs');

const questions = [
  {
    name: 'releaseType',
    type: 'list',
    message: 'What kind of release do you want to make?',
    choices: ['patch', 'minor', 'major']
  }
];

inquirer
  .prompt(questions)
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
    cp.execSync(`npm version ${releaseType}`);
  })
  .catch((err) => {
    console.log('Publishing failed:');
    console.log(err);
    // eslint-disable-next-line no-process-exit
    process.exit(-1);
  });
