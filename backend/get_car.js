(params) => {
  let cars = api.run("this.list_cars")[0];
  let keys = Object.keys(cars);
  let index = keys.indexOf(params.vehicle);
  if (index >= 0) {
    return cars[params.vehicle];
  }
  return null;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */