(params) => {
  const parameters = { range: 'Cars!A1:I30', spreadsheetId: '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong' };
  let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
  let cars = {};
  let keys = sheet_rows.shift();
  for (var i in sheet_rows) {
    let car = {};
    for (var key in keys) {
      car[keys[key]] = sheet_rows[i][key];
    }
    car.Features = car.Tags.split(", ");
    delete car.Tags;

    car.Licence = car["Licence plate"];
    delete car["Licence plate"];

    car.Email = car["Email address"];
    delete car["Email address"];

    if (car["Availability"] === "Only available at specified times") {
      car.AlwaysAvailable = false;
    } else {
      car.AlwaysAvailable = true;
    }
    delete car["Availability"];
    
    if (car["Confirmation"] === "Email me to confirm requests") {
      car.Confirm = true;
    } else {
      car.Confirm = false;
    }
    delete car["Confirmation"];

    car["Description"] = `${car.Color} ${car.Make} ${car.Model}`;
    cars[car["Licence"]] = car;
  }
  
  return cars;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */