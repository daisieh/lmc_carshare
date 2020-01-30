(params) => {
  const moment = require("moment-timezone-with-data.js");
  moment.tz.setDefault("America/Vancouver");
  let start = moment(params.start_datetime);
  let end = moment(params.end_datetime);
  return {start, end};
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */