(params) => {
  // 
  console.log(uuid());
  let this_car = api.run("this.get_car", {vehicle: params.vehicle})[0];
  if (this_car.Confirm && params.confirmed == null) {
    //send an email
    console.log("send an email");
    
  } else {
    console.log("make the request");
    let calendar_id = api.run("this.get_calendarlist", {vehicle: params.vehicle})[0].id;
    const parameters = {};
    parameters.calendarId = calendar_id;
    parameters.sendUpdates = 'all';
    parameters.$body = {
      summary : `${params.requester} using ${this_car.Description}`,
      start : {
        dateTime : params.starttime
      },
      end : {
        dateTime : params.endtime
      },
      attendees : [{'email': params.requester, responseStatus: "accepted"},{'email': params.vehicle, responseStatus: "accepted"}]
    };
    return api.run('google_calendar.create_calendar_event', parameters);

  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */