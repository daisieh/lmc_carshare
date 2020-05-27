(params) => {
  let calendar_id = api.run("this.get_calendarlist", {vehicle: params.vehicle})[0].id;
  let car = api.run("this.get_car", {vehicle: params.vehicle})[0];
  
  // send the request to the owner:
  let request_params = { 
    to: params.vehicle,
    subject: 'Your vehicle has been requested',
    message: `Your vehicle ${car.Description} has been requested for ${params.start} to ${params.end}.`,
    userId: 'me'
  };
  let confirmed = true;
  if (car.Confirm && params.confirmed == null) {
    // we need to send an email to the car owner
    confirmed = false;
    request_params.message += `\nReply to this email to approve the request. Ignore this message if you don't want to approve it.`
  } else {
    // go ahead and make the reservation
    request_params.to = params.requester;
  }

  let message = api.run('google_mail.send_message', request_params)[0];
  console.log(message);
  // add the request to the google sheet
  return api.run("this.append_request_sheet_data", {data: [ message.threadId, params.vehicle, params.requester, params.start, params.end, confirmed ]});
  
  parameters = {};
  parameters.calendarId = calendar_id;
  parameters.sendUpdates = 'all';
  parameters.$body = {
    summary : `${params.requester} using ${car.Description}`,
    start : {
      dateTime : params.start
    },
    end : {
      dateTime : params.end
    },
    attendees : [{'email': params.requester, responseStatus: "accepted"},{'email': params.vehicle, responseStatus: "accepted"}]
  };
  

  //return api.run('google_calendar.create_calendar_event', parameters);
  
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */