const core = require('@actions/core')
const github = require('@actions/github')

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")

// Initialize Modules
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
  console.log("GITHUB:", JSON.stringify(github, null, 2))
  console.log("CONTEXT:", JSON.stringify(github.context, null, 2))

  //checkWorkflowDeps()
  //runPrelease()
}

async function checkWorkflowDeps() {

  const { data: listRepoWorkflows } = await octokit.actions.listRepoWorkflows({
    owner,
    repo,
  });

  // const workflowId = listRepoWorkflows.workflows.find(repo => repo.name.match("PreReleaseTag"))

  // console.log(workflowId)

  // const { data } = await octokit.actions.listWorkflowRuns({
  //   owner,
  //   repo,
  //   workflow_id:"3095081"
  // });


  const jobs = await octokit.actions.listJobsForWorkflowRun({
    owner: owner,
    repo: repo,
    run_id: "318040286",
    filter: 'latest'
  })

  
  
   console.log("DATA: ",JSON.stringify(jobs, null, 2))
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
