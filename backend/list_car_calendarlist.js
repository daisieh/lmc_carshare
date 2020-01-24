(params) => {
  const _ = require("underscore.js");
  let cars = Object.keys(api.run("this.list_cars")[0]);
  let all_calendars = api.run('google_calendar.get_calendarlist', {}, {limit: 30});
  let calendars = {};
  let calendar_names = [];
  for (var i in all_calendars) {
    if (cars.includes(all_calendars[i].summary)) {
      calendars[all_calendars[i].summary] = all_calendars[i];
      calendar_names.push(all_calendars[i].summary);
    }
  }
  let cars_to_map = _.difference(cars, calendar_names);
  for (var i in cars_to_map) {
    console.log(`adding car: ${cars_to_map[i]}`);
    const parameters = {};
    parameters.$body = {
      summary : cars_to_map[i],
      timeZone : 'America/Vancouver'
    };
    let cal = api.run('google_calendar.create_calendar', parameters);
    calendars[cars_to_map[i]] = cal;
  }
  
  
  
  return calendars;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */