const core = require("@actions/core");
const github = require("@actions/github");
const request = require("request");

(async () => {
  const event = core.getInput("event");
  const message = core.getInput("message");
  const clientPayload = github.context.payload.client_payload;
  const secret = process.env.WEBHOOK_SECRET ? process.env.WEBHOOK_SECRET : core.getInput("secret");
  const url = process.env.WEBHOOK_URL ? process.env.WEBHOOK_URL : core.getInput("url");
  const commits = github.context.payload.commits;

  let sha = process.env.GITHUB_SHA;
  let repo = process.env.GITHUB_REPOSITORY;
  let ref = process.env.GITHUB_REF;
  let commitMessage = "";
  let commitAuthor = "";
  let actor = "";
  let messageReference = "";

  if(clientPayload && clientPayload.sha) {
    sha = clientPayload.sha;
  }

  if(clientPayload && clientPayload.ref) {
    ref = clientPayload.ref;
  }

  if(clientPayload && clientPayload.message_reference) {
    messageReference = clientPayload.message_reference;
  }

  if (clientPayload && clientPayload.commit_message) {
    commitMessage = clientPayload.commit_message;
  } else if (commits && commits.length > 0) {
    commitMessage = commits[0].message;
  }

  if (clientPayload && clientPayload.commit_author) {
    commitAuthor = clientPayload.commit_author;
  } else if (commits && commits.length > 0) {
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
      actor: actor,
      message: message
    }

    await request({ url: url, method: "POST", json: true, body: data });
    core.setOutput("result", true);

  } catch (error) {
    core.setFailed(error.message);
  }
})();