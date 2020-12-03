(params) => {
  if (params.Licence == null || params.Licence == "") {
    throw "Licence plate is required"
  }
  
  let new_car =   {
    "Timestamp": (new Date()).toString(),
    "Make": params.Make,
    "Model": params.Model,
    "Color": params.Color,
    "Notes": params.Notes,
    "Features": params.Features,
    "Licence": params.Licence,
    "Email": params.Email,
    "AlwaysAvailable": params.Availability,
    "Confirm": params.Confirm
  }
  
  let cars = api.run("this.list_cars");
  let values = [];
  values.push(cars.shift());
  // look for the car to see if it needs to be updated
  let is_new_car = true;
  for (var i in cars) {
    if (cars[i].Licence === new_car.Licence) {
      console.log (`updating ${new_car.Licence}`);
      cars[i] = new_car;
      is_new_car = false;
    }
  }
  
  if (is_new_car == true) {
    cars.push(new_car);
    // create calendar for bookings:
    let parameters = {};
    parameters.$body = {
      summary : new_car.Licence,
      timeZone : 'America/Vancouver'
    };
    try {
      api.run('google_calendar.create_calendar', parameters)[0];
    } catch (e) {
      console.log(e);
    }
    parameters.$body.summary = `${new_car.Licence}_available`;
    try {
      api.run('google_calendar.create_calendar', parameters)[0];
    } catch (e) {
      console.log(e);
    }

    if (!new_car.AlwaysAvailable) {
    }
  }
  
  // convert back to array for sheet:
  let parameters = {};
  parameters.range = 'Cars!A:J';
  parameters.spreadsheetId = env.get("spreadsheet_id");
  parameters.valueInputOption = "RAW";
  return values;

  for (var i in cars) {
    let val = api.run("this.car_object_to_sheet_row", {car_object: cars[i]});
    values.push(val);
  }
  parameters.$body = { values : values };
  let result = api.run('google_sheets.update_sheet_values', parameters);
  if (result[0].updatedColumns != 7) {
    throw "couldn't update requests";
  }
  return cars;
}
