const core = require("@actions/core");
const github = require("@actions/github");
const request = require("request");

(async () => {
  const event = core.getInput("event");
  const secret = core.getInput("secret");
  const url = core.getInput("url");
  const sha = process.env.GITHUB_SHA;
  const repo = process.env.GITHUB_REPOSITORY;
  const ref = process.env.GITHUB_REF;

  try {
    const data = {
      secret: secret,
      event_type: event,
      sha: sha,
      repo: repo,
      ref: ref
    }

    const json = JSON.stringify(data);

    console.log(github);
    console.log(`Triggering ${event}`);

    await request({ url: url, method: "POST", headers: { "Content-Type": "application/json"} }, json);
    core.setOutput("result", true);

  } catch (error) {
    core.setFailed(error.message);
  }
})();