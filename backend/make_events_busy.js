(params) => {
  const moment = require('moment.js');
  let results = {};
  let calendars = Object.values(api.run("this.list_calendars")[0]);
  for (var i in calendars) {
    const parameters = {};
    parameters.calendarId = calendars[i];
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