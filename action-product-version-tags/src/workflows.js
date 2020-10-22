const fs = require('fs');
const yaml = require('js-yaml');
module.exports = function (octokit, owner, repo) {
  const readWorkflowsAndFilterByName = function (name) {
    try {
      const workflows = []
      const workflowDir=".github/workflows"
      const files = fs.readdirSync(workflowDir)
  
      files.forEach(async function (file) {
        let fileContents = fs.readFileSync(`${workflowDir}/${file}`, 'utf8');
        let data = yaml.safeLoad(fileContents);
        workflows.push(data)
      });
      return workflows.find(workflow => workflow.name === name)
    } catch (err) {
      throw err
    }
  }

  const checkWorkflowDeps =  async function (workflows, sha) {

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
  
  return {
    readWorkflowsAndFilterByName,
    checkWorkflowDeps

}}