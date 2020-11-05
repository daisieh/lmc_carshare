(params) => {
  if (params.Licence == null || params.Licence == "") {
    throw "Licence plate is required"
  }
  let cars = api.run("this.list_cars");
  let values = [];
  values.push(cars.shift());
  // look for the car to see if it needs to be updated
  let is_updated = false;
  for (var i in cars) {
    if (cars[i].Licence === params.Licence) {
      console.log (`updating ${params.Licence}`);
      cars[i] = params;
      is_updated = true;
    }
  }
  if (is_updated == false) {
    // append to the end:
    cars.push(params);
  }
  
  // convert back to array for sheet:
  let parameters = {};
  parameters.range = 'Cars!A:I';
  parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
  parameters.valueInputOption = "RAW";
  for (var i in cars) {
    let val = [];
    for (var j in values[0]) {
      val.push(cars[i][values[0][j]]);
    }
    values.push(val);
  }
  parameters.$body = { values : values };
  let result = api.run('google_sheets.update_sheet_values', parameters);
  if (result[0].updatedColumns != 7) {
    throw "couldn't update requests";
  }
  return cars;
}
