(params) => {
  const moment = require("moment-timezone-with-data.js");
  let start = moment.tz(new Date(params.start_datetime), "America/Vancouver").format();
  let end = moment.tz(new Date(params.end_datetime), "America/Vancouver").format();
  return {start, end};
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */