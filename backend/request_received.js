({ http_event }) => {
  const base64 = require('base64.js').Base64;
  let body = http_event.parsed_body;
  let data = JSON.parse(base64.decode(body.message.data));
  const parameters = {};
  parameters.userId = 'me';
  parameters.startHistoryId = parseInt(stash.get("historyId"));
  parameters.historyTypes = 'messageAdded';
  let history = api.run('google_mail.list_history_of_mailbox', parameters);
  if (history.length == 0) {
    return {
      status_code: 200,
      headers: { "Content-Type": "application/json" },
      body: "nothing"
    };
  } else {
    let last_hist = history[history.length - 1];
    stash.put("historyId", last_hist.id);
    let messageId = last_hist.messages.pop().id;
    let message = api.run("google_mail.get_message", { id: messageId, userId: "me", format: "minimal"})[0];
    console.log(message);
    if (message.labelIds.includes(env.get("request_label"))) {
      // find request by message.threadId in the sheet
      let requests = api.run("this.list_requests");
      for (var i in requests) {
        if (message.threadId === requests[i].threadId) {
          requests[i].confirmed = true;
        }
        api.run("this.update_append_request", requests[i]);
        return {
          status_code: 200,
          headers: { "Content-Type": "application/json" },
          body: { "success" }
        };
      }
    }
    return {
      status_code: 500,
      headers: { "Content-Type": "application/json" },
      body: { message }
    };
  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */