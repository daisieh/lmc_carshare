(params) => {
  // remove all associated requests
  let requests = api.run("this.list_requests");
  let to_delete = [];
  for (var i in requests) {
    if (requests[i].vehicle === params.licence) {
      to_delete.push(requests[i].eventId);
    }
  }
  let results = api.run("this.delete_requests", {eventIds: to_delete});
  console.log(results);
  // remove the calendars
  let all_calendars = api.run('google_calendar.get_calendarlist');
  let delete_cals = [];
  for (var i in all_calendars) {
    if (all_calendars[i].summary.includes("params.licence") || all_calendars[i].summary.includes(`${params.licence}_available`)) {
      delete_cals.push(all_calendars[i].id);
    }
  }
  console.log(delete_cals);
  for (var i in delete_cals) {
    api.run('google_calendar.delete_calendar', {calendarId: delete_cals[i]});
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
