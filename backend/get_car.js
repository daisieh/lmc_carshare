(params) => {
  if ("licence" in params && "owner" in params) {
    throw "can't get car with both licence and owner";
  }
  let cars = api.run("this.list_cars")[0];
  for (var i in cars) {
    console.log(cars[i]);
    if (cars[i].Licence === params.licence) {
      return cars[i];
    }
    if (cars[i].Email === params.owner) {
      return cars[i];
    }
  }
  return null;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */