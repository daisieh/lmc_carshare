(params) => {
  let features = [];

  if (params.all_features) {
      const parameters = { range: 'Features!A1:A30', spreadsheetId: env.get("spreadsheet_id") };
      let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
      for (var i in sheet_rows) {
        features.push(...sheet_rows[i]);
      }

      return features;
  }
  let cars = api.run("this.list_cars")[0];
  for (var i in cars) {
    let this_feat = cars[i].Features;
    for (var j in this_feat) {
      if (!features.includes(this_feat[j])) {
        features.push(this_feat[j]);
      }      
    }
  }
  return features;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */