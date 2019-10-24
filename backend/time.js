(params) => {
  const moment = require("moment-timezone-with-data.js");
  return {
    startToday: moment().tz("America/Los_Angeles").startOf("day"),
    endToday: moment().tz("America/Los_Angeles").endOf("day")
  };
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */