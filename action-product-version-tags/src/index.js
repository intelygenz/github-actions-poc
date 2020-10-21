const core = require('@actions/core')
const github = require('@actions/github');


// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")

// Initialize Modules
const {readWorkflowsAndFilterByName} = require('./workflows')

const { calcReleaseBranch } = require('./branches')(octokit, owner, repo)
const { calcTagBranch, createTag } = require('./tags')(octokit, owner, repo)


// Input variables
const dryRun =  core.getInput('dry-run') == "true" ? true : false
const currentMajor = parseInt(core.getInput('current-major'))
const prefix = core.getInput('prefix')
const preRelease = core.getInput('pre-release')
const defaultBranch = core.getInput('default-branch')

main()

async function main() {
  try {
    const workflows = readWorkflowsAndFilterByName(github.context.workflow)
    const success = await checkWorkflowDeps(workflows.on.workflow_run.workflows, github.context.sha)
    if(!success) return console.log("Action skipped because another workflows for the same commit are in progress")
    runPrelease()

  } catch (err) {
    console.log(err)
  }
}



async function checkWorkflowDeps(workflows, sha) {

  const { data: listRepoWorkflows } = await octokit.actions.listRepoWorkflows({
    owner,
    repo,
  });

  const workflowIDs = listRepoWorkflows.workflows
    .filter(repoWorkflow => workflows.includes(repoWorkflow.name))
    .map(repoWorkflow => repoWorkflow.id)


  const getData = async () => {
    return Promise.all(
      workflowIDs.map(async (workflowId) => {
        const { data: workflowRunsObject } = await octokit.actions.listWorkflowRuns({
         owner,
         repo,
         workflow_id: workflowId,
         filter: 'latest'
       });
   
       const commitWorkflows = workflowRunsObject.workflow_runs
         .filter(workflowRun => workflowRun.head_sha === sha)
   
       console.log(JSON.stringify(commitWorkflows, null, 2)) 
       const successWorkflows = commitWorkflows.filter(workflowRun => workflowRun.conclusion === "success")
       return Promise.resolve({commitWorkflows: commitWorkflows.length, successWorkflows: successWorkflows.length})
     })
    )
  }

  let commitWorkflowsLength = 0;
  let successWorkflowsLength = 0;

  const results = await getData()
  results.map( row => {
    commitWorkflowsLength += row.commitWorkflows
    successWorkflowsLength += row.successWorkflows
  })

  console.log("commitWorkflowsLength",commitWorkflowsLength)
  console.log("successWorkflowsLength",successWorkflowsLength)


  return commitWorkflowsLength === successWorkflowsLength
}

async function runPrelease() {
  try {    
    let release = await calcReleaseBranch(currentMajor, prefix)
    if (preRelease) {
      console.log("Generating prerelease")
      release = await calcTagBranch(release, preRelease)
    }
    core.setOutput("release", release)
  
    if (!dryRun) createTag(release, defaultBranch)
  
    console.log("🚀 New Release: ",release)

  } catch (error) {
    core.setFailed(error.message);
  }
}
