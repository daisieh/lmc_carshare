(params) => {
  // 
  console.log(uuid());
  let this_car = api.run("this.get_car", {vehicle: params.car_email})[0];
  if (this_car.Confirm && params.confirmed == null) {
    //send an email
    console.log("send an email");
  } else {
    console.log("make the request");
    let calendar_id = api.run("this.get_calendarlist", {vehicle: params.vehicle})[0].id;
    let car = api.run("this.get_car", {vehicle: params.vehicle})[0];
    const parameters = {};
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
      attendees : [{'email': params.requester}]
    };
    //return api.run('google_calendar.create_calendar_event', parameters);

  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */