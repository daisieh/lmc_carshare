(params) => {
  const moment = require('moment-timezone-with-data.js');
  const interval = params.interval; // number of secs in one hour is 3600
  let start = moment(params.start);
  let end = moment(params.start).add(1,"day");
  let car_events = api.run("this.list_car_busy_schedule", {start: start, end: end})[0];
  let car_lines = [];
  car_events.interval = interval;
  car_events.busy_segments = car_lines;

  for (var i in car_events.cars) {
    let car = car_events.cars[i];
    let events = car_events.car_events[i];
    let hours = '';
    let current = moment(start).format('X');
    while (events.length > 0) {
      let event = events.shift();
      let this_start = moment(event.start).format('X');
      let this_end = moment(event.end).format('X');
      let freespan = (parseInt(this_start) - parseInt(current))/interval;
      let busyspan = (parseInt(this_end) - parseInt(this_start))/interval;
      hours += `${"0".repeat(freespan)}${"1".repeat(busyspan)}`;
      current = this_end;
    }
    let freespan = (parseInt(moment(end).format('X')) - parseInt(current))/interval;
    hours += "0".repeat(freespan);

    car_lines.push(hours);
  }
  delete car_events["car_events"];
  return car_events;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */