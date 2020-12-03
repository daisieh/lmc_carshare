(params) => {
  let cars = api.run("this.list_cars")[0];
  return Object.values(cars);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */