(params) => {
  const momenttz = require('moment-timezone-with-data.js');
  const moment = require('moment.js');
  let car = api.run("this.get_car", {owner: params.vehicle})[0];
  let calendar_id = api.run("this.list_car_calendarlist")[0][car.Licence];
  let request = { vehicle: car.Licence,
                  requester: params.requester,
                  start: momenttz(params.start).tz("America/Vancouver"),
                  end: momenttz(params.end).tz("America/Vancouver")
                };
  
  // send the request to the owner:
  let request_params = { 
    to: car.Email,
    subject: 'Your vehicle has been requested',
    message: `${params.requester} has requested your vehicle ${car.Description} for ${request.start.format("YYYY-MM-DD HH:mm")} to ${request.end.format("YYYY-MM-DD HH:mm")}.`,
    userId: 'me'
  };
  if (car.Confirm) {
    // we need to send an email to the car owner
    request.confirmed = false;
    request_params.message += `\nReply to this email to approve the request. Ignore this message if you don't want to approve it.`
  } else {
    // go ahead and make the reservation
    // request_params.to = request.requester;
    request.confirmed = true;
  }

  let message = api.run('google_mail.send_message', request_params)[0];
  request.threadId = message.threadId;
  console.log(message);

  // create calendar event:
  let parameters = {};
  parameters.calendarId = calendar_id;
  parameters.sendUpdates = 'all';
  parameters.$body = {
    summary : `${request.requester} using ${car.Description}`,
    conferenceDataVersion: 0,
    start : {
      dateTime : moment(request.start).format()
    },
    end : {
      dateTime : moment(request.end).format()
    },
    attendees : []
  };
  
  if (request.confirmed) {
    parameters.$body.attendees.push({'email': request.requester, responseStatus: "accepted"});
  }  
  let event = api.run('google_calendar.create_calendar_event', parameters)[0];
  request.eventId = event.id;
  request.start = request.start.format("YYYY-MM-DDTHH:mm:00ZZ");
  request.end = request.end.format("YYYY-MM-DDTHH:mm:00ZZ");

  // send a notification to the requester:
  if (request.confirmed) {
    api.run("this.send_email_to_requester", {eventId: request.eventId});
  }

  // add request to master spreadsheet
  let requests = api.run("this.update_append_request", request);
  if (requests.length > 0) {
    let last_request = requests.pop();
    if (last_request.eventId == request.eventId) {
      return last_request;
    } else {
      return null;
    }
  }
}

  // {
  //   "threadId": "1757c4d50ce23512",
  //   "requester": "daisieh@gmail.com",
  //   "eventId": "g04ud9m1p400dkebj92sk9nva4",
  //   "start": "2020-10-30T20:00:00-07:00",
  //   "end": "2020-10-30T21:00:00-07:00",
  //   "confirmed": true,
  //   "vehicle": "AL675T"
  // }
