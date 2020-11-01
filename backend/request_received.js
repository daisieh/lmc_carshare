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
    if (message.labelIds.includes(env.get("request_label"))) {
      // find request by message.threadId in the sheet
      let requests = api.run("this.list_requests");
      requests.shift();
      for (var i in requests) {
        let request = requests[i];
        if (message.threadId === request.threadId) {
          console.log(request);
          console.log("confirmed");
          request.confirmed = true;
          api.run("this.update_append_request", request);
          let car = api.run("this.get_car", {licence: request.vehicle})[0];
          let request_params = { 
            to: request.requester,
            subject: 'Your carshare request has been confirmed',
            message: `You've been approved to borrow ${car.Description} from ${request.start} to ${request.end}.`,
            userId: 'me'
          };

          message = api.run('google_mail.send_message', request_params)[0];

          return {
            status_code: 200,
            headers: { "Content-Type": "application/json" },
            body: { message }
          };
        }
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