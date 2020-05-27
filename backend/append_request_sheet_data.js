(params) => {
  // add the request to the google sheet
  let parameters = {};
  parameters.valueInputOption = 'USER_ENTERED';
  parameters.range = 'Requests!A:F';
  parameters.spreadsheetId = '1kyd3g0xuPYoyDuT6joT0gkl29YCFE56E2ktv6haRong';
  parameters.responseValueRenderOption = 'FORMATTED_VALUE';
  parameters.insertDataOption = 'INSERT_ROWS';
  parameters.responseDateTimeRenderOption = 'FORMATTED_STRING';
  parameters.$body = {
//     threadId	vehicle	requester	start	end	confirmed
    values : [ params.data ]
  };
  return api.run('google_sheets.append_sheet_values', parameters);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */