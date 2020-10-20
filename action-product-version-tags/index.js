const core = require('@actions/core')
const github = require('@actions/github')

const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")

const dryRun =  core.getInput('dry-run') == "true" ? true : false
const currentMajor = parseInt(core.getInput('current-major'))
const prefix = core.getInput('prefix')
const preRelease = core.getInput('pre-release')
const defaultBranch = core.getInput('default-branch')

main()

async function main() {
  try {    
    let release = await calcReleaseBranch()
  
    if (preRelease) {
      console.log("Generating prerelease")
      release = await calcTagBranch(release)
    }
    core.setOutput("release", release)
  
    if (!dryRun) createTag(release)
  
    console.log("🚀 New Release: ",release)

  } catch (error) {
    core.setFailed(error.message);
  }
}

async function searchBranchNames() {
  let branchNames = []
  let data_length = 0
  let page = 0;
  try {
    do {
      const { data } = await octokit.repos.listBranches({
        owner,
        repo,
        per_page: 100,
        page
      });
      const branchNamesPerPage = data.map(branch => branch.name)
      data_length = branchNamesPerPage.length
      branchNames.push(...branchNamesPerPage)
      page++
    } while (data_length == 100)
  } catch (error) {
    console.log(error)
  }

  return branchNames.reverse()
}




async function calcReleaseBranch() {
  try {
    const branchNames = await searchBranchNames()
    let major = currentMajor
    let minor = 0

    const regex = new RegExp(`^${prefix}(\\d+).(\\d+)$`, 'g')

    
    const greaterReleaseBranches = branchNames.filter(branchName => {
      if(branchName.match(`^${prefix}${major+1}.[0-9]+$`)) return true
      return false
    })

    if(greaterReleaseBranches.length > 0) throw new Error('Branch with greater major version already exist')


    const branchesWithPrefix = branchNames.filter(branchName => {
      if(branchName.match(`^${prefix}${major}.[0-9]+$`)) return true
      return false
    })

    if(branchesWithPrefix.length === 0) {
      return `${prefix}${major}.${minor}`
    }

    const releaseBranch = branchesWithPrefix[0]
    const matches = regex.exec(releaseBranch)
    major = parseInt(matches[1]);
    minor = parseInt(matches[2]);

    return `v${major}.${minor+1}`

  } catch (error) {
    throw new Error(error)
  }
}

async function searchTagNames() {
  let tagNames = []
  let data_length = 0
  let page = 0;
  try {
    do {
      const { data } = await octokit.repos.listTags({
        owner,
        repo,
        per_page: 100,
        page
      });
      const tagNamesPerPage = data.map(tag => tag.name)
      data_length = tagNamesPerPage.length
      tagNames.push(...tagNamesPerPage)
      page++
    } while (data_length == 100)
  } catch (error) {
    console.log(error)
  }

  return tagNames
}


async function calcTagBranch(release) {
  try {
    const tagNames = await searchTagNames()
    const tagsWithPrefix = tagNames.filter(tagName => tagName.match(`^${release}-${preRelease}`))

    if(tagsWithPrefix.length === 0) return `${release}-${preRelease}.0`
    const regex = new RegExp(`^${release}-${preRelease}.(\\d+)$`, 'g')
    const releaseTag = tagsWithPrefix[0]

    const matches = regex.exec(releaseTag)
    bumpVersion = parseInt(matches[1]);
    return `${release}-${preRelease}.${bumpVersion+1}`

  } catch (error) {
    console.log(error)
  }
}

async function createTag(tagName) {
  console.log("Creating tag")
  try {
    const { data:branchData } = await octokit.repos.getBranch({
      owner,
      repo,
      branch: defaultBranch
    });
    const mainBranchSHA = branchData.commit.sha
    const { data:tagData } = await octokit.git.createTag({
      owner,
      repo,
      tag: tagName,
      message: `Release ${tagName}`,
      object: mainBranchSHA,
      type: "commit"
    });
    const { data:createTagData } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/tags/${tagName}`,
      sha: tagData.sha,
      object: mainBranchSHA,
      type: "commit"
    });
    console.log("Tag ref created: ",createTagData.ref)
  } catch (error) {
    console.log(error)
  }
}

