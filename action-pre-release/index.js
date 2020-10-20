const core = require('@actions/core');
const github = require('@actions/github');

const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const dryRun =  core.getInput('dry-run') == "true" ? true : false;
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
  
    console.log("🚀 New Release: ",release)

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

    const regex = new RegExp(`^${prefix}(\\d+).(\\d+)$`, 'g')
    const branchesWithPrefix = branches.filter(branch => {
      if(branch.name.match(`^${prefix}[0-9]+.[0-9]+$`)) return true
      return false
    })

    console.log("BRANCHES", branchesWithPrefix)



    // branchesWithPrefix.sort(function(a, b){
    //   console.log("A",regex.exec(a.name))
    //   console.log("B",regex.exec(b.name))
    //   // const [aMinor, aMayor] = regex.exec(a.name)
    //   // const [bMinor, bMayor] = regex.exec(b.name)
    //   // console.log("A", aMayor, aMinor)
    //   // console.log("B", bMayor, bMinor)
    //   // if (a es menor que b según criterio de ordenamiento) {
    //   //   return -1;
    //   // }
    //   // if (a es mayor que b según criterio de ordenamiento) {
    //   //   return 1;
    //   // }
    //   // // a debe ser igual b
    //   // return 0;
    // })

    console.log(JSON.stringify(branchesWithPrefix.length))




    if(branchesWithPrefix.length === 0) {
      return `${prefix}${mayor}.${minor}`
    }

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
    //TODO: Per page manage
    const { data:tags } = await octokit.repos.listTags({
      owner,
      repo,
      per_page: 100
    });

    const tagsWithPrefix = tags.filter(tag => tag.name.match(`^${release}-${preRelease}`))
    if(tagsWithPrefix.length === 0) return `${release}-${preRelease}.0`
    const regex = new RegExp(`^${release}-${preRelease}.(\\d)$`, 'g')
    const releaseTag = tagsWithPrefix[0]
    const matches = regex.exec(releaseTag.name)
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
      branch: 'main'
    });
    const mainBranchSHA = branchData.commit.sha
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

