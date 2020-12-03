(params) => {
  const parameters = { range: 'Cars!A1:J30', spreadsheetId: env.get("spreadsheet_id") };
  let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
  let cars = {};
  let keys = sheet_rows.shift();
  for (var i in sheet_rows) {
    let car = api.run("this.car_sheet_row_to_object", {sheet_row: sheet_rows[i]})[0];
    cars[car["Licence"]] = car;
  }
  
  return cars;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */