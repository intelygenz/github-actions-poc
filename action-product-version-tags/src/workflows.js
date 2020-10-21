const fs = require('fs');
const yaml = require('js-yaml');
module.exports = {
    readWorkflowsAndFilterByName: function (name) {
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
}