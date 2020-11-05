(params) => {
  const moment = require('moment-timezone-with-data.js');
  let requests = api.run("this.list_requests");
  let keys = requests.shift();
  for (var i in requests) {
    if (requests[i].eventId === params.eventId) {
      let car = api.run("this.get_car", {"licence": requests[i].vehicle})[0];
      // send the request to the owner:
      let request_params = { 
        to: car.Email,
        subject: 'Your vehicle has been requested',
        message: `${requests[i].requester} has requested your vehicle ${car.Description} for ${moment(requests[i].start).format("YYYY-MM-DD HH:mm")} to ${moment(requests[i].end).format("YYYY-MM-DD HH:mm")}.`,
        userId: 'me',
        threadId: requests[i].threadId
      };
      request_params.message += `\nThe requester would like to remind you to reply to this email to approve the request. Ignore this message if you don't want to approve it.`

      let message = api.run('google_mail.send_message', request_params)[0];
    }
  }
}
/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */