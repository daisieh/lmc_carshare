(params) => {
  // remove all associated requests
  let requests = api.run("this.list_requests");
  let to_delete = [];
  for (var i in requests) {
    if (requests[i].vehicle === params.licence) {
      to_delete.push(requests[i].eventId);
    }
  }
  api.run("this.delete_requests", {eventIds: to_delete});
  
  // remove the calendars
  let all_calendars = api.run("this.list_calendars")[0];
  // return all_calendars[`${params.licence}_available`];
  try {
    api.run('google_calendar.delete_calendar', {calendarId: all_calendars[params.licence]});
  } catch (e) {
    console.log(e.message);
  }
  try {
    api.run('google_calendar.delete_calendar', {calendarId: all_calendars[`${params.licence}_available`]});
  } catch (e) {
    console.log(e.message);
  }
  
  // remove the car
  let parameters = { range: 'Cars!A1:Z50', spreadsheetId: env.get("spreadsheet_id") };
  let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
  let rows_to_keep = [sheet_rows.shift()];
  let licence_index = rows_to_keep[0].indexOf("Licence plate");
  for (var i in sheet_rows) {
    let row = sheet_rows[i];
    if (sheet_rows[i][licence_index] !== params.licence) {
      rows_to_keep.push(sheet_rows[i]);
    }
  }

  // clear sheet range:
  parameters.$body = { };
  api.run('google_sheets.clear_sheet_values', parameters);

  parameters.valueInputOption = "RAW";
  parameters.$body = { values : rows_to_keep };
  let result = api.run('google_sheets.update_sheet_values', parameters);
  return result;
}
