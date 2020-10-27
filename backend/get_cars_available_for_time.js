(params) => {
  const moment = require('moment-timezone-with-data.js');
  let calendars = api.run("this.list_car_calendarlist")[0];
  let times = api.run("this.normalize_times", {start_datetime: params.start, end_datetime: params.end})[0];
  let startTime = moment(times.start).tz("America/Vancouver").format("YYYY-MM-DD h:mm a zz");
  let endTime = moment(times.end).tz("America/Vancouver").format("YYYY-MM-DD h:mm a zz");
  console.log(`looking for cars between ${startTime} and ${endTime}`);
  let cars = api.run("this.list_cars")[0];
  let available_cars = [];
  let calendar_ids = [];
  for (var i in calendars) {
    calendar_ids.push({id: calendars[i].id});
  }
  let freebusy = api.run('google_calendar.get_calendars_freebusy', {$body: { timeMax : times.end, timeMin : times.start, items : calendar_ids , timeZone: 'America/Vancouver'}})[0];
  // return freebusy;
  
  for (var i in calendars) {
    if (!cars[i].AlwaysAvailable) {
      console.log(`checking to see if (default busy) ${cars[i].Description} is busy...`);
      if (freebusy.calendars[calendars[i].id].busy.length > 0) {
        // console.log(`...listed as busy, so it's available`);
        available_cars.push(cars[i]);
      }
    } else {
      console.log(`checking to see if (default available) ${cars[i].Description} is busy...`);
      if (freebusy.calendars[calendars[i].id].busy.length == 0) {
        // console.log("...not busy, so it's available");
        available_cars.push(cars[i]);
      }
    }
  }
  //return available_cars.map((x) => { return { Description: x.Description, Email: x.Email }; });
  //return api.run("this.get_features_list", { cars: available_cars });
  return {start: moment.tz(times.start, "America/Vancouver").format("YYYY-MM-DD HH:mm"), end: moment.tz(times.end, "America/Vancouver").format("YYYY-MM-DD HH:mm"), cars: available_cars};
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */