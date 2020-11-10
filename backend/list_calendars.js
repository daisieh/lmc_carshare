(params) => {
  let cars = api.run("this.list_cars")[0];
  let availability_calendars = [];
  for (var i in cars) {
    if (!cars[i].AlwaysAvailable) {
      availability_calendars.push(`${i}_available`);
    }
    availability_calendars.push(i);
  }
  let all_calendars = api.run('google_calendar.get_calendarlist', {}, {limit: 30});
  let calendars = {};
  for (var i in all_calendars) {
    if (availability_calendars.includes(all_calendars[i].summary)) {
      calendars[all_calendars[i].summary] = all_calendars[i].id;
    }
  }
    
  return calendars;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */