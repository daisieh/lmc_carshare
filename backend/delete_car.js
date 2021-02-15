(params) => {
  let this_car;
  
  // find the car
  let parameters = { range: 'Cars!A1:Z50', spreadsheetId: env.get("spreadsheet_id") };
  let sheet_rows = api.run('google_sheets.get_sheet_values', parameters)[0].values;
  let rows_to_keep = [sheet_rows.shift()];
  let licence_index = rows_to_keep[0].indexOf("Licence plate");
  for (var i in sheet_rows) {
    let row = sheet_rows[i];
    if (sheet_rows[i][licence_index] !== params.licence) {
      rows_to_keep.push(sheet_rows[i]);
    } else {
      this_car = api.run('this.car_sheet_row_to_object', {sheet_row: sheet_rows[i]})[0];
    }
  }
  
  if (this_car == null) {
    throw `No car with licence ${params.licence}`;
  }

  // remove all associated requests
  let requests = api.run("this.list_requests");
  let to_delete = [];
  for (var i in requests) {
    if (requests[i].vehicle === this_car.Licence) {
      to_delete.push(requests[i].eventId);
    }
  }
  let results = api.run("this.delete_requests", {eventIds: to_delete});
  console.log(`deleted ${JSON.stringify(results)}`);
  
  // remove the calendars
  try {
    api.run('google_calendar.delete_calendar', {calendarId: this_car.BookingCalendar});
  } catch (e) {
    console.log(e.message);
  }
  try {
    api.run('google_calendar.delete_calendar', {calendarId: this_car.AvailableCalendar});
  } catch (e) {
    console.log(e.message);
  }
  
  // let all_calendars = api.run('google_calendar.get_calendarlist');
  // let delete_cals = [];
  // for (var i in all_calendars) {
  //   if (all_calendars[i].summary.includes("params.licence") || all_calendars[i].summary.includes(`${params.licence}_available`)) {
  //     delete_cals.push(all_calendars[i].id);
  //   }
  // }
  // console.log(delete_cals);
  // for (var i in delete_cals) {
  //   api.run('google_calendar.delete_calendar', {calendarId: delete_cals[i]});
  // }
  
  // clear sheet range:
  parameters.$body = { };
  api.run('google_sheets.clear_sheet_values', parameters);

  parameters.valueInputOption = "RAW";
  parameters.$body = { values : rows_to_keep };
  let result = api.run('google_sheets.update_sheet_values', parameters);

  return result;
}
