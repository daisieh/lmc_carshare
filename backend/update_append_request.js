(params) => {
  let requests = api.run("this.list_requests");
  let values = [];
  values.push(Object.keys(requests[0]));

  // look for the request to see if it needs to be updated
  let is_updated = false;
  for (var i in requests) {
    if (requests[i].threadId === params.threadId) {
      console.log (`updating ${params.threadId}`);
      requests[i] = params;
      is_updated = true;
    }
  }
  if (is_updated == false) {
    // append to the end:
    requests.push(params);
  }
  
  // convert back to array for sheet:
  let parameters = {};
  parameters.range = 'Requests!A:G';
  parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
  parameters.valueInputOption = "RAW";
  for (var i in requests) {
    let val = [];
    for (var j in values[0]) {
      val.push(requests[i][values[0][j]]);
    }
    values.push(val);
  }
  parameters.$body = { values : values };
  let result = api.run('google_sheets.update_sheet_values', parameters);
  if (result[0].updatedColumns != 7) {
    throw "couldn't update requests";
  }
  return requests;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */