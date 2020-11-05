(params) => {
  let requests = api.run("this.list_requests");
  let values = [];
  let deleted = [];
  values.push(requests.shift());
  let new_requests = [];
  // look for the request to see if it needs to be updated
  for (var i in requests) {
    if (params.eventIds.includes(requests[i].eventId)) {
      // delete the calendar event as well
      let cals = api.run("this.list_car_calendarlist")[0];
      try {
        api.run('google_calendar.delete_calendar_event', { eventId: requests[i].eventId, calendarId: cals[requests[i].vehicle] });
      } catch (e) {
        console.log("couldn't delete event " + requests[i].eventId + ": " + e);
      }
      deleted.push(requests[i]);
    } else {
      new_requests.push(requests[i]);
    }
  }
  
  // convert back to array for sheet:
  let parameters = {};
  parameters.range = 'Requests!A:G';
  parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
  
  // clear sheet range:
  parameters.$body = { };
  api.run('google_sheets.clear_sheet_values', parameters);

  parameters.valueInputOption = "RAW";
  for (var i in new_requests) {
    let val = [];
    for (var j in values[0]) {
      val.push(new_requests[i][values[0][j]]);
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