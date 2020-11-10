(params) => {
  const moment = require('moment-timezone-with-data.js');
  let requests = api.run("this.list_requests");
  let keys = requests.shift();
  for (var i in requests) {
    let request = requests[i];
    if (request.eventId === params.eventId) {
      let car = api.run("this.get_car", {"licence": requests[i].vehicle})[0];
      let request_params = { 
        to: request.requester,
        subject: `LMC Carshare reservation`,
        message: `You have reserved ${car.Description} for ${moment.tz(request.start, 'America/Vancouver').format("h:mm a MMMM D YYYY")} to ${moment.tz(request.end, 'America/Vancouver').format("h:mm a MMMM D YYYY")}.`,
        userId: 'me',
        threadId: request.threadId
      };

      let message = api.run('google_mail.send_message', request_params)[0];
      console.log(message);

    }
  }
}
/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */