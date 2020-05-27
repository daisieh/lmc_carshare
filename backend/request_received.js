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
    //if (env.get("request_label") in message.labelIds) {
      // find request by message.threadId in the sheet
      let parameters = {};
      parameters.range = 'Requests!A:F';
      parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
      message = api.run("google_sheets.get_sheet_values", parameters);
    //}
    return {
      status_code: 200,
      headers: { "Content-Type": "application/json" },
      body: { message }
    };
  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */