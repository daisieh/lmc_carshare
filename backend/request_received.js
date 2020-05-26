({ http_event }) => {
  const base64 = require('base64.js').Base64;
  let body = http_event.parsed_body;
  let data = JSON.parse(base64.decode(body.message.data));
  const parameters = {};
  parameters.userId = 'me';
  parameters.startHistoryId = stash.get("historyId");
  parameters.historyTypes = 'messageAdded';
  let message = api.run('google_mail.list_history_of_mailbox', parameters);
  
  // {
  //       "message": {
  //         "data": "eyJlbWFpbEFkZHJlc3MiOiJsbWMuY2Fyc2hhcmVAZ21haWwuY29tIiwiaGlzdG9yeUlkIjoxODczfQ==",
  //         "messageId": "945081858192555",
  //         "message_id": "945081858192555",
  //         "publishTime": "2020-01-21T01:21:18.422Z",
  //         "publish_time": "2020-01-21T01:21:18.422Z"
  //       },
  //       "subscription": "projects/carshare-265707/subscriptions/request"
  //     }
  return {
    status_code: 200,
    headers: { "Content-Type": "application/json" },
    body: { message }
  };
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */