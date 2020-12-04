(params) => {
  if (params.Licence == null || params.Licence == "") {
    throw "Licence plate is required"
  }
  let features = [];
  if (params.Features != null) {
    features = params.Features.split(/, */);
  }
  
  let new_car =   {
    "Timestamp": (new Date()).toString(),
    "Make": params.Make,
    "Model": params.Model,
    "Color": params.Color,
    "Notes": params.Notes,
    "Features": features,
    "Licence": params.Licence,
    "Email": params.Email,
    "AlwaysAvailable": (params.AlwaysAvailable.toLowerCase() === "true"),
    "Confirm": (params.Confirm.toLowerCase() === "true"),
    "AvailableCalendar": params.AvailableCalendar,
    "BookingCalendar": params.BookingCalendar
  }
  
  let cars = api.run("this.get_all_cars");
  // look for the car to see if it needs to be updated
  let is_new_car = true;
  for (var i in cars) {
    if (cars[i].Licence === new_car.Licence) {
      console.log (`updating ${new_car.Licence}`);
      cars[i] = new_car;
      is_new_car = false;
    }
  }
  
  let parameters = {};
  if (new_car.BookingCalendar == null || new_car.BookingCalendar === "") {
    // create calendar for bookings:
    parameters.$body = {
      summary : new_car.Licence,
      timeZone : 'America/Vancouver'
    };
    try {
      let cal = api.run('google_calendar.create_calendar', parameters)[0];
      new_car.BookingCalendar = cal.id;
    } catch (e) {
      console.log(e);
    }
  }
  if (new_car.AvailableCalendar == null || new_car.AvailableCalendar === "") {
    parameters.$body = {
      summary : `${new_car.Licence}_available`,
      timeZone : 'America/Vancouver'
    };
    try {
      let cal = api.run('google_calendar.create_calendar', parameters)[0];
      new_car.AvailableCalendar = cal.id;
    } catch (e) {
      console.log(e);
    }
  }
  api.run("this.set_calendar_access", {calendarId: new_car.BookingCalendar, user: new_car.Email, canWrite: true});
  api.run("this.set_calendar_access", {calendarId: new_car.BookingCalendar, user: new_car.Email, canWrite: !new_car.AlwaysAvailable});

  if (is_new_car == true) {
    cars.push(new_car);
    console.log("new car");
  }
  
  // convert back to array for sheet:
  parameters = {};
  parameters.range = 'Cars!A:Z';
  parameters.spreadsheetId = env.get("spreadsheet_id");
  parameters.valueInputOption = "RAW";
  let values = [];
  let keys = api.run("this.car_object_to_sheet_row", {});
  values.push(keys);
  
  for (var i in cars) {
    let val = api.run("this.car_object_to_sheet_row", {car_object: cars[i]});
    values.push(val);
  }
  parameters.$body = { values : values };
  let result = api.run('google_sheets.update_sheet_values', parameters);
  if (result[0].updatedColumns != 12) {
    throw "couldn't update requests";
  }
  return cars;
}
