const core = require("@actions/core");
const github = require("@actions/github");
const https = require("https");

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
    commitMessage = commits.slice(-1)[0].message;
  }

  if (clientPayload && clientPayload.commit_author) {
    commitAuthor = clientPayload.commit_author;
  } else if (commits && commits.length > 0) {
    commitAuthor = commits.slice(-1)[0].author.name;
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

    const body = JSON.stringify(data);
    const parsedUrl = new URL(url);

    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      }, (res) => {
        let responseData = "";
        res.on("data", (chunk) => { responseData += chunk; });
        res.on("end", () => { resolve(responseData); });
      });

      req.on("error", (err) => { reject(err); });
      req.write(body);
      req.end();
    });

    core.setOutput("result", true);

  } catch (error) {
    core.setFailed(error.message);
  }
})();
