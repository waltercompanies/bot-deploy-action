const core = require("@actions/core");
const github = require("@actions/github");
const request = require("request");

(async () => {
  const event = core.getInput("event");
  const secret = process.env.WEBHOOK_SECRET ? process.env.WEBHOOK_SECRET : core.getInput("secret");
  const url = process.env.WEBHOOK_URL ? process.env.WEBHOOK_URL : core.getInput("url");
  const sha = process.env.GITHUB_SHA;
  const repo = process.env.GITHUB_REPOSITORY;
  const ref = process.env.GITHUB_REF;
  const clientPayload = github.context.payload.client_payload;
  const messageReference = clientPayloud ? clientPayload.message_reference : "";
  const commits = github.context.payload.commits;
  let commitMessage = "", commitAuthor = "";
  let actor = "";

  if (clientPayload && clientPayload.commit_message) {
    commitMessage = clientPayload.commit_message;
  } else if (commits.length > 0) {
    commitMessage = commits[0].message;
  }

  if (clientPayload && clientPayload.commit_author) {
    commitAuthor = clientPayload.commit_author;
  } else if (commits.length > 0) {
    commitAuthor = commits[0].author.name;
  }

  if(clientPayload && clientPayload.actor) {
    actor = clientPayload.actor;
  }

  try {
    const data = {
      secret: secret,
      event_type: event,
      sha: sha,
      repo: repo,
      ref: ref,
      message_reference: messageReference,
      commit_message: commitMessage,
      commit_author: commitAuthor,
      actor: actor
    }

    await request({ url: url, method: "POST", json: true, body: data });
    core.setOutput("result", true);

  } catch (error) {
    core.setFailed(error.message);
  }
})();