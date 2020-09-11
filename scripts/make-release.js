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
  },
  releaseTicket: {
    type: 'input',
    describe: `What's the release ticket in Jira(e.g. NODE-123)?`,
    filter: (val) => val.toUpperCase(),
    validate: (data) => {
      const validTicket = data.match(/[a-zA-z]{2,7}-[\d]{1,7}/);
      if (validTicket) {
        return true;
      }

      return 'Please enter a valid Jira release ticket(e.g. NODE-123)';
    }
  }
};

yargsInteractive()
  .usage('$0 [args]')
  .interactive(options)
  .then(({ releaseType, releaseTicket }) => {
    cp.execSync(
      `${__dirname}/make-release-branch.sh ${releaseType} ${releaseTicket}`
    );

    fs.writeFileSync(
      `${__dirname}/../.fn-inspect-release.json`,
      JSON.stringify({ ticket: releaseTicket })
    );

    /* eslint-disable-next-line no-console */
    console.log(`
      A release has been kicked off here: https://github.com/Contrast-Security-Inc/node-fn-inspect/actions.
    `);
  })
  .catch((err) => {
    /* eslint-disable no-console */
    console.log('Making release failed:');
    console.log(err);
  });
