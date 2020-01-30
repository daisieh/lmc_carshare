(params) => {
  const moment = require("moment-timezone-with-data.js");
  moment.tz.setDefault("America/Vancouver");
  let start = moment(params.start_datetime).format();
  let end = moment(params.end_datetime).format();
  return {start, end};
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */