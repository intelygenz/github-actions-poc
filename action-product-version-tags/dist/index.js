module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 140:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(207)
const github = __webpack_require__(385)

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")

// Initialize Modules
const { calcReleaseBranch } = __webpack_require__(626)(octokit, owner, repo)
const { calcTagBranch, createTag } = __webpack_require__(338)(octokit, owner, repo)

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


/***/ }),

/***/ 626:
/***/ ((module) => {

module.exports = function (octokit, owner, repo) {
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
        } catch (err) {
            throw new Error(err)
        }

        return branchNames.reverse()
      }
      
      
      
    async function calcReleaseBranch(currentMajor, prefix) {
        
        try {
            const branchNames = await searchBranchNames(octokit, owner, repo)
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
    
        } catch (err) {
            throw new Error(err)
        }
    }
    return {calcReleaseBranch} 
}


/***/ }),

/***/ 338:
/***/ ((module) => {

module.exports = function(octokit, owner, repo) {
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
        } catch (err) {
            throw new Error(err)
        }
      
        return tagNames
    }
      
      
    async function calcTagBranch(release, preRelease) {
        try {
            const tagNames = await searchTagNames(octokit, owner, repo)
            const tagsWithPrefix = tagNames.filter(tagName => tagName.match(`^${release}-${preRelease}`))
        
            if(tagsWithPrefix.length === 0) return `${release}-${preRelease}.0`
            const regex = new RegExp(`^${release}-${preRelease}.(\\d+)$`, 'g')
            const releaseTag = tagsWithPrefix[0]
        
            const matches = regex.exec(releaseTag)
            bumpVersion = parseInt(matches[1]);
            return `${release}-${preRelease}.${bumpVersion+1}`
        
        } catch (err) {
            throw new Error(err)
        }
    }
      
    async function createTag(tagName, defaultBranch) {
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
        } catch (err) {
            throw new Error(err)
        }
    }
    return {calcTagBranch, createTag}
}

  

/***/ }),

/***/ 207:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 385:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(140);
/******/ })()
;