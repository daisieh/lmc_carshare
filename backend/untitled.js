(params) => {
  const moment = require('moment-timezone-with-data.js');
//  return moment.tz('2020-11-24 00:00', "America/Vancouver")
  const parameters = {};
  parameters.calendarId = '65r8crdn7e33ni8g35a81bg2o0@group.calendar.google.com';
  parameters.showDeleted = true;
  return api.run('google_calendar.get_acl_rules', parameters, {limit: 10});

}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */