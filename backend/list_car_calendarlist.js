(params) => {
  let cars = Object.keys(api.run("this.list_cars")[0]);
  let all_calendars = api.run('google_calendar.get_calendarlist', {}, {limit: 30});
  let calendars = {};
  for (var i in all_calendars) {
    if (cars.includes(all_calendars[i].summary)) {
      calendars[all_calendars[i].summary] = all_calendars[i];
    }
  }
    
  return calendars;
}
