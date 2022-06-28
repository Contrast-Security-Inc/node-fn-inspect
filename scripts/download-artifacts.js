/* eslint-disable no-process-exit */
// @ts-check
'use strict';

const { Octokit } = require('@octokit/rest');
const https = require('https');
const path = require('path');
const rimraf = require('rimraf');
const unzipper = require('unzipper');

const { AUTH_TOKEN } = process.env;

if (!AUTH_TOKEN) {
  console.error(
    'ERROR: You must set AUTH_TOKEN to a GitHub personal access token with the `repo` scope and SSO Authorization.'
  );
  console.error(
    'See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token'
  );
  process.exit(1);
}

const octokit = new Octokit({ auth: AUTH_TOKEN });
const owner = 'Contrast-Security-Inc';
const repo = 'node-fn-inspect';

const prebuildsDir = path.resolve(__dirname, '../prebuilds');

// calculate 90 days ago
const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

// find most recent runs
octokit.actions
  .listWorkflowRunsForRepo({
    owner,
    repo,
    status: 'success',
    created: `>=${date.toISOString()}`,
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(({ data }) => {
    // we are only interested in "Release" runs
    const runs = data.workflow_runs.filter((run) => run.name === 'Release');

    if (runs.length < 1) {
      console.error(
        'ERROR: Unable to find any release workflow runs within the last 90 days'
      );
      process.exit(1);
    }

    const { id } = runs.reduce((max, run) =>
      max.run_number > run.run_number ? max : run
    );

    // retrieve artifact data from most recent workflow run within last 90 days
    return octokit.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: id,
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(({ data }) => {
    if (data.artifacts.length < 1) {
      console.error('ERROR: Unable to find any artifacts for the provided run');
      process.exit(1);
    }

    const [artifact] = data.artifacts;

    // download prebuilds artifact and extract to prebuilds/
    return octokit.actions
      .downloadArtifact({
        owner,
        repo,
        artifact_id: artifact.id,
        archive_format: 'zip',
      })
      .then(({ url }) =>
        // clean up prebuilds/ dir
        new Promise((resolve, reject) => {
          rimraf(prebuildsDir, (err) => {
            if (err) reject(err);
            resolve(undefined);
          });
        }).then(
          () =>
            // download and extract artifact
            new Promise((resolve) => {
              https.get(url, (res) => {
                res
                  .pipe(unzipper.Extract({ path: prebuildsDir }))
                  .on('close', () => {
                    console.log(
                      'artifact "%s" downloaded and extracted to %s/',
                      artifact.name,
                      path.relative(process.cwd(), prebuildsDir)
                    );
                    resolve(undefined);
                  });
              });
            })
        )
      );
  })
  .catch((err) => {
    console.error('ERROR: Unable to download and extract artifacts');
    console.error(err);
    process.exit(1);
  });
