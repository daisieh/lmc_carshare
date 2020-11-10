(params) => {
  const moment = require('moment-timezone-with-data.js');
  let calendars = api.run("this.list_availability_calendarlist")[0];
  let startTime = moment(params.start).tz("America/Vancouver").format("YYYY-MM-DDTHH:mm:00Z");
  let endTime = moment(params.end).tz("America/Vancouver").format("YYYY-MM-DDTHH:mm:00Z");
  let cars = api.run("this.list_cars")[0];
  let calendar_ids = Object.keys(calendars).map(x => { return {id: calendars[x]}; });
  let freebusy = api.run('google_calendar.get_calendars_freebusy', {$body: { timeMax : endTime, timeMin : startTime, items : calendar_ids , timeZone: 'America/Vancouver'}})[0];

  let events = {};
  for (var car in cars) {
    events[car] = [];
  }
  for (var cal in calendars) {
    if (cal.includes("_available")) {
      // looking at an availability calendar
      // every time in the range that is not "busy" is actually
      let free_times = freebusy.calendars[calendars[cal]].busy;
      if (free_times.length > 0) {
        let this_free = free_times.shift();
        let busy_times = [{start: startTime, end: this_free.start}];
        while (free_times.length > 0) {
          let next = {start: this_free.end};
          this_free = free_times.shift();
          next.end = this_free.start;
          busy_times.push(next);
        }
        busy_times.push({start: this_free.end, end: endTime});
        events[cal.replace("_available", "")].push(...busy_times);
      }
    } else {
      // looking at a regular booking calendar
      events[cal].push(...freebusy.calendars[calendars[cal]].busy);
    }
  }
  // sort the car events:
  let car_keys = [];
  let car_events = [];
  for (var car in cars) {
    events[car].sort((a,b) => {
      if (moment(a.start).isBefore(b.start)) { return -1; }
      if (moment(a.start).isSame(b.start)) { return 0; }
      return 1;
    });
    // remove any events that have the same start and end,
    let this_events = [];
    for (var i in events[car]) {
      if (!moment(events[car][i].start).isSame(events[car][i].end)) {
        this_events.push(events[car][i]);
      }
    }
    car_keys.push(car);
    car_events.push(this_events);
  }
  return { 
    start: startTime, 
    end: endTime,
    cars: car_keys,
    car_events: car_events
  };
}