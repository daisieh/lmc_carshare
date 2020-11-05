(params) => {
  const moment = require('moment-timezone-with-data.js');
  let cars = api.run("this.list_cars")[0];
  let parameters = {};
  parameters.range = 'Requests!A:G';
  parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
  let raw_data = api.run("google_sheets.get_sheet_values", parameters)[0];
  let results = [];
  let names = raw_data.values[0];
  for (var i in raw_data.values) {
    if (i == 0) continue;
    let row = raw_data.values[i];
    let entry = {};
    for (var j in row) {
      entry[names[j]] = row[j];
    }
    entry.start = moment(entry.start).tz("America/Vancouver").format("YYYY-MM-DDTHH:mm:00ZZ");
    entry.end = moment(entry.end).tz("America/Vancouver").format("YYYY-MM-DDTHH:mm:00ZZ");

    // entry.vehicle = cars[entry.vehicle].Description;
    results.push(entry);
  }
  
  results.sort((a,b) => {
    if (a.start === b.start) { return 0; }
    if (moment(a.start).isBefore(b.start)) { return -1; }
    return 1;
  });
  
  results.unshift(names);
  return results;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */