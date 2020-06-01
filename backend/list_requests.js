(params) => {
  let parameters = {};
  parameters.range = 'Requests!A:G';
  parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
  let raw_data = api.run("google_sheets.get_sheet_values", parameters)[0];
  let results = [];
  let names = raw_data.values[0];
  if (raw_data.values.length == 1) {
    return {props: names};
  }
  for (var i in raw_data.values) {
    if (i == 0) continue;
    let row = raw_data.values[i];
    let entry = {};
    for (var j in row) {
      entry[names[j]] = row[j];
    }
    results.push(entry);
  }
  return results;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */