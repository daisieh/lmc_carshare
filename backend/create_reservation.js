(params) => {
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
    attendees : [{'email': params.requester},{'email': params.vehicle}]
  };
  return api.run('google_calendar.create_calendar_event', parameters);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */