({ http_event }) => {
  const base64 = require('base64.js').Base64;
  let body = http_event.parsed_body;
  let data = JSON.parse(base64.decode(body.message.data));
  const parameters = {};
  parameters.userId = 'me';
  parameters.startHistoryId = parseInt(stash.get("historyId"));
  parameters.historyTypes = 'messageAdded';
  let history = api.run('google_mail.list_history_of_mailbox', parameters);
  console.log(history);
  if (history.length == 0) {
    console.log("nothing");
    return {
      status_code: 200,
      headers: { "Content-Type": "application/json" },
      body: "nothing"
    };
  } else {
    let last_hist = history[history.length - 1];
    stash.put("historyId", last_hist.id);
    // for (var i in history) {
      let messageId = last_hist.messages.pop().id;
      let message = api.run("google_mail.get_message", { id: messageId, userId: "me", format: "raw"})[0];
    console.log(message);  
    console.log(base64.decode(message.raw));
    //}
    return {
      status_code: 200,
      headers: { "Content-Type": "application/json" },
      body: { history }
    };
  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */