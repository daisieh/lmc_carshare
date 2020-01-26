(params) => {
  let result = [];
  for (var i in params.cars) {
    for (var j in params.cars[i].Features) {
      if (!result.includes(params.cars[i].Features[j])) {
        result.push(params.cars[i].Features[j]);
      }
    }
  }
  return result;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */