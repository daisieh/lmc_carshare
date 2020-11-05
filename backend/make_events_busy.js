(params) => {
  const moment = require('moment.js');
  let results = {};
  let availability_calendars = Object.values(api.run("this.list_availability_calendarlist")[0]);
  for (var i in availability_calendars) {
    const parameters = {};
    parameters.calendarId = availability_calendars[i];
    parameters.timeMin = moment().subtract(14, "days").format();
    let events = api.run('google_calendar.get_calendar_events', parameters);
    for (var j in events) {
      parameters.eventId = events[j].id;
      parameters.$body = {
        transparency : 'opaque',
      };
      try {
        api.run('google_calendar.update_calendar_event', parameters);
      } catch (e) {
        console.log(e);
      }
    }
  }
  return results;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */