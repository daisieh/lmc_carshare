(params) => {
  const moment = require('moment-timezone-with-data.js');
  const interval = parseInt(params.interval); // number of secs in one hour is 3600
  let start = moment.tz(params.start,"America/Vancouver").format("YYYY-MM-DDTHH:mm:00Z");
  let end = moment.tz(params.start,"America/Vancouver").add(3,"day").format("YYYY-MM-DDTHH:mm:00Z");
  let car_lines = [];
  let car_events = api.run("this.list_car_busy_schedule", {start: start, end: end})[0];
  car_events.interval = interval;
  for (var i in car_events.cars) {
    let car = car_events.cars[i];
    let events = car_events.car_events[i];
    let hours = ',';
    let current = parseInt(moment(start).format('X')/interval);
    while (events.length > 0) {
      let event = events.shift();
      let this_start = parseInt(moment(event.start).format('X')/interval);
      let this_end = parseInt(moment(event.end).format('X')/interval);
      let freespan = this_start - current;
      let busyspan = this_end - this_start;
      console.log(`busyspan ${busyspan}`);
     hours += `${",".repeat(freespan)}${"1".repeat(busyspan)}`;
      // hours += `${freespan} ${busyspan} `;

      current = this_end;
    }
    let this_end = parseInt(moment(end).format('X')/interval);
    let freespan = this_end - current;
    console.log(`freespan ${freespan}`);

    // hours += `${freespan},`;
    hours += ",".repeat(freespan) + ",";
    // replace 1-char blocks:
    hours = hours.replace(/,1,/g,",o,");

    // replace 2-char blocks:
    hours = hours.replace(/,11,/g,",<>,");

    // replace 3-char blocks:
    hours = hours.replace(/,111,/g,",<->,");

    // replace more than 4-char blocks:
    hours = hours.replace(/,11/g,",<-").replace(/11,/g,"->,").replace(/1/g,"-");

    // trim off ends
    hours = hours.replace(/^,/,"").replace(/,$/,"");
    car_lines.push(hours);
  }
  car_events.busy_segments = car_lines;
  car_events.interval = interval;

  delete car_events["car_events"];
  return car_events; 
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */