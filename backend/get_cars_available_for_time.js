(params) => {
  const moment = require('moment-timezone-with-data.js');
  let calendars = api.run("this.list_calendars")[0];
  console.log(calendars);
  let startTime = moment(params.start).tz("America/Vancouver");
  let endTime = moment(params.end).tz("America/Vancouver");
  console.log(`looking for cars between ${startTime} and ${endTime}`);
  let cars = api.run("this.list_cars")[0];
  let available_cars = [];
  let calendar_ids = Object.keys(calendars).map(x => { return {id: calendars[x]}; });
  let freebusy = api.run('google_calendar.get_calendars_freebusy', {$body: { timeMax : endTime, timeMin : startTime, items : calendar_ids , timeZone: 'America/Vancouver'}})[0];
  for (var car in cars) {
    if (!cars[car].AlwaysAvailable) {
      // check its availability calendar
      console.log(`checking to see if (default busy) ${cars[car].Description} is busy on cal ${car}_available...`);
      if (freebusy.calendars[calendars[`${car}_available`]].busy.length > 0) {
        // console.log(`...listed as busy, so it's available`);
        if (freebusy.calendars[calendars[car]].busy.length == 0) {
          // console.log("...not busy, so it's available");
          available_cars.push(cars[car]);
        }
      }
    } else {
      console.log(`checking to see if (default available) ${cars[car].Description} is busy...`);
      if (freebusy.calendars[calendars[car]].busy.length == 0) {
        // console.log("...not busy, so it's available");
        available_cars.push(cars[car]);
      }      
    }
  }
  return { 
    start: startTime.format("YYYY-MM-DD HH:mm zz"), 
    end: endTime.format("YYYY-MM-DD HH:mm zz"), 
    cars: available_cars
  };
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */