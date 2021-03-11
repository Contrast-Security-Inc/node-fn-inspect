const fs = require('fs');
const https = require('https');
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.AUTH_TOKEN});
const repo = { 
    owner: 'Contrast-Security-Inc',
    repo: 'node-fn-inspect'
}

const getLatestRunID = async function(args) {
    const workflowsRuns = (await octokit.actions.listWorkflowRunsForRepo({
        ...args,
        branch: 'main',
        conclusion: 'success'
    })).data.workflow_runs;
    const latestRun = workflowsRuns.reduce((max, run) => max.run_number > run.run_number ? max : run);
    return latestRun.id;
}

const getLatestArtifactID = async function(args) {
    const latestArtifacts = (await octokit.actions.listWorkflowRunArtifacts({
        ...args,
        run_id: await getLatestRunID(args)
    })).data.artifacts;
    const funcinfoTar = latestArtifacts.find(artifact => artifact.name === 'funcinfo.tgz');
    return funcinfoTar.id;
}

const downloadLatestArtifact = async function(args) {
    const latestArtifactURL = (await octokit.actions.downloadArtifact({
        ...args,
        artifact_id: await getLatestArtifactID(args),
        archive_format: 'zip'
    })).url;
    const artifactFile = fs.createWriteStream("funcinfo.tgz.zip");
    https.get(latestArtifactURL, function(res) {
        res.pipe(artifactFile);
    });
}

downloadLatestArtifact(repo).then(() => {
    console.log('Successfully downloaded latest artifact');
}).catch((err) => {
    console.log(`Failed to download latest artifact\n${err.stack}`);
    process.exit(-1);
})