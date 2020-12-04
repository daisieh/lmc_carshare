(params) => {
  let calendars = api.run("this.list_calendars")[0];
  console.log(calendars);
  let cars = api.run("this.list_cars")[0];
  let available_cars = [];
  let calendar_ids = Object.keys(calendars).map(x => { return {id: calendars[x]}; });
  let schedule = api.run("this.list_car_busy_schedule", {start: params.start, end: params.end})[0];
  console.log(schedule)
  for (var i in schedule.car_events) {
    if (schedule.car_events[i].length == 0) {
      available_cars.push(schedule.cars[i]);
    } 
  }
  return { 
    start: params.start, 
    end: params.end, 
    cars: available_cars
  };
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */