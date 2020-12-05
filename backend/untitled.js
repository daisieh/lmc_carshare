(params) => {
  const moment = require('moment-timezone-with-data.js');
//  return moment.tz('2020-11-24 00:00', "America/Vancouver")

  const parameters = { range: 'Cars!A1:Z50', spreadsheetId: env.get("spreadsheet_id") };
  let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
  let rows_to_keep = [sheet_rows.shift()];
  let licence_index = rows_to_keep[0].indexOf("Licence plate");
  for (var i in sheet_rows) {
    if (sheet_rows[i][licence_index] !== "AL675T") {
      rows_to_keep.push(sheet_rows[i]);
    }
  }
  return rows_to_keep;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */