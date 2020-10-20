const core = require('@actions/core');
const github = require('@actions/github');

const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const dryRun = Boolean(core.getInput('dry-run'));
const prefix = core.getInput('prefix')
const preRelease = core.getInput('pre-release');

main()

async function main() {
  try {    
    let release = await calcReleaseBranch(prefix)
  
    if (preRelease) {
      console.log("Generating prerelease")
      release = await calcTagBranch(release)
    }

    core.setOutput("release", release);
  
    if (!dryRun) createTag(release)
  
    console.log("New Release: ",release)

  } catch (error) {
    core.setFailed(error.message);
  }
}


async function calcReleaseBranch(prefix) {
  try {
    const { data:branches } = await octokit.repos.listBranches({
      owner,
      repo
    });

    let mayor = 0, minor = 0;

    const branchesWithPrefix = branches.filter(branch => branch.name.match(`^${prefix}`)).reverse()
    if(branchesWithPrefix.length === 0) {
      return `${prefix}${mayor}.${minor}`
    }

    const regex = new RegExp(`^${prefix}(\\d).(\\d)$`, 'g')
    const releaseBranch = branchesWithPrefix[0]
    const matches = regex.exec(releaseBranch.name)
    mayor = parseInt(matches[1]);
    minor = parseInt(matches[2]);
    return `${prefix}${mayor}.${minor+1}`

  } catch (error) {
    console.log(error)
  }
}

async function calcTagBranch(release) {
  try {
    const { data:tags } = await octokit.repos.listTags({
      owner,
      repo
    });

    const tagsWithPrefix = tags.filter(tag => tag.name.match(`^${release}-${preRelease}`)).reverse()
    if(tagsWithPrefix.length === 0) return `${release}-${preRelease}.0`

    const regex = new RegExp(`^${release}-${preRelease}.(\\d)$`, 'g')
    const releaseTag = tagsWithPrefix[0]
    const matches = regex.exec(releaseTag.name)
    bumpVersion = parseInt(matches[1]);
    return `${release}-${prerelease}.${bumpVersion+1}`

  } catch (error) {
    console.log(error)
  }
}


async function createTag(tagName) {
  try {
    const { data:branchData } = await octokit.repos.listBranches({
      owner,
      repo
    });
    const mainBranchSHA = branchData.filter((elem) => {
      if (elem.name === 'main') return elem
    })[0].commit.sha
    console.log("SHA", mainBranchSHA)
    const { data:tagData } = await octokit.git.createTag({
      owner,
      repo,
      tag: tagName,
      message: "tag message",
      object: mainBranchSHA,
      type: "commit"
    });
    console.log("DATA TAG: ",JSON.stringify(tagData, null, 2))
    const { data:crateTagData } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/tags/${tagName}`,
      sha: tagData.sha,
      object: mainBranchSHA,
      type: "commit"
    });
    console.log("CREATE DATA TAG: ",JSON.stringify(crateTagData, null, 2))
  } catch (error) {
    console.log(error)
  }
}

async function searchTag(tagName) {
  try {
    const { data: tag} = await octokit.git.getRef({
      owner,
      repo,
      ref: `tags/${tagName}`
    })
    console.log(tag)

  } catch (error) {
    console.log(error)
  }
}