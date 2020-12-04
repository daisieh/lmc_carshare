(params) => {
  const moment = require('moment-timezone-with-data.js');
//  return moment.tz('2020-11-24 00:00', "America/Vancouver")
    const parameters = {};
  parameters.calendarId = '5fc1dl3ok9ae6efnd7avuf7om8@group.calendar.google.com';
  return api.run('google_calendar.get_acl_rules', parameters, {limit: 10});
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */