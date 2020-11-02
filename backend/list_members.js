(params) => {
  const parameters = { range: 'A1:A50', spreadsheetId: '12ZNQzKVV81dHiPSk0LzubcBi6embfG_5xN4IXWiLIXQ' };
  let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
  let keys = sheet_rows.shift();
  let members = [];
  for (var i in sheet_rows) {
    members.push(sheet_rows[i][0]);
  }
  
  return members;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */