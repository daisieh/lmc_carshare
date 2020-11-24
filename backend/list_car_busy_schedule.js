(params) => {
  const moment = require('moment-timezone-with-data.js');
      
  let calendars = api.run("this.list_calendars")[0];
  let startTime = moment(params.start).tz("America/Vancouver").format("YYYY-MM-DDTHH:mm:00Z");
  let endTime = moment(params.end).tz("America/Vancouver").format("YYYY-MM-DDTHH:mm:00Z");
  let cars = api.run("this.list_cars")[0];
  let calendar_ids = Object.keys(calendars).map(x => { return {id: calendars[x]}; });
  // return api.run('google_calendar.get_calendars_freebusy', {$body: { timeMax : endTime, timeMin : startTime, items : calendar_ids , timeZone: 'America/Vancouver'}})[0];

  let freebusy = {timeMin: startTime, timeMax: endTime, calendars:{}};
  for (var i of calendar_ids) {
    let busy = [];
    const parameters = {};
    parameters.calendarId = i.id;
    parameters.timeMax = endTime;
    parameters.timeMin = startTime;
    parameters.singleEvents = false;
    let e = api.run('google_calendar.get_calendar_events', parameters).map(x => {
      let start, end;
      if ("date" in x.start) {
        start = moment.tz(x.start.date,"America/Vancouver");
        end = moment.tz(x.end.date,"America/Vancouver");
      } else {
        start = x.start.dateTime;
        end = x.end.dateTime;
      }
      if (moment(start).isBefore(params.start)) {
        start = startTime;
      }
      if (moment(end).isAfter(params.end)) {
        end = endTime;
      }

      return {start: start, end: end};
    })
    // if (e.length == 0) {
    // let fb = api.run('google_calendar.get_calendars_freebusy', {$body: { timeMax : endTime, timeMin : startTime, items : [{id: i.id}] , timeZone: 'America/Vancouver'}})[0];
    // console.log(fb.calendars[i.id]);
    // }
    busy.push(...e);
    freebusy.calendars[i.id] = {busy: busy};
  }
  // return freebusy;
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
        // console.log(`pushing ${events[car][i].start} ${events[car][i].end}`)
        this_events.push(events[car][i]);
      }
    }
    // merge events that overlap
    if (this_events.length > 1) {
      let final_events = [];
      while (this_events.length > 1) {
        // look at the first two events
        // if the curr and next overlap, they're just one event.
        // make a new event and unshift that back onto the array.
        // otherwise, unshift the second.
        let curr_event = this_events.shift();
        let next_event = this_events.shift();
        console.log(`comparing ${curr_event.start},${curr_event.end} to ${next_event.start},${next_event.end}`)
        if (moment(next_event.start).isSameOrBefore(curr_event.end)) {
          let overlap_event = {start: curr_event.start, end: next_event.end};
          // but if next_event is wholly inside curr_event, 
          // make the end the same as curr
          if (moment(next_event.end).isSameOrBefore(curr_event.end)) {
            overlap_event.end = curr_event.end;
          }
          console.log(`overlap event is ${overlap_event.start},${overlap_event.end}`);
          // final_events.push(overlap_event);
          this_events.unshift(overlap_event);
        } else {
          final_events.push(curr_event);
          this_events.unshift(next_event);
        }
      }
      final_events.push(this_events.shift());
      
      this_events = final_events;
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
