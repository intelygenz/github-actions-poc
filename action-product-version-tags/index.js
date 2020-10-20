const core = require('@actions/core')
const github = require('@actions/github')

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")

// Initialize Modules
const { calcReleaseBranch } = require('./src/branches')(octokit, owner, repo)
const { calcTagBranch, createTag } = require('./src/tags')(octokit, owner, repo)

// Input variables
const dryRun =  core.getInput('dry-run') == "true" ? true : false
const currentMajor = parseInt(core.getInput('current-major'))
const prefix = core.getInput('prefix')
const preRelease = core.getInput('pre-release')
const defaultBranch = core.getInput('default-branch')

main()

async function main() {
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
