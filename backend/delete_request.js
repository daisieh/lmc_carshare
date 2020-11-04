(params) => {
  let requests = api.run("this.list_requests");
  let values = [];
  let deleted;
  values.push(requests.shift());
  // look for the request to see if it needs to be updated
  for (var i in requests) {
    if (requests[i].eventId === params.eventId) {
      console.log (`deleting ${params.eventId}`);
      // delete the calendar event as well
      let cals = api.run("this.list_car_calendarlist")[0];
      api.run('google_calendar.delete_calendar_event', { eventId: params.eventId, calendarId: cals[requests[i].vehicle].id });
      deleted = requests[i];
      requests.splice(i,1);
    }
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
  return deleted;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */