const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  getData()

console.log("hola")
} catch (error) {
  core.setFailed(error.message);
}

async function getData () {
  const octokit = github.getOctokit("722f0e425af1269f20a8684726d22e6d35fe0285")
  // const { data: pullRequest } = await octokit.pulls.get({})
  console.log(`***----GITHUB CONTEXT: ${JSON.stringify(octokit, null, 2)}`)

}