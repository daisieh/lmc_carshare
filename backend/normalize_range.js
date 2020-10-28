(params) => {
  const moment = require("moment-timezone-with-data.js");
  let starttime = moment(params.start_datetime).format();//.replace("+00:00", "");
  let start = moment.tz(starttime, "America/Vancouver");
  
  let endtime = moment(params.end_datetime).format();//.replace("+00:00", "");
  let end = moment.tz(endtime, "America/Vancouver");
  return {start, end};
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */