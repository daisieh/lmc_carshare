(params) => {
  let cars = api.run("this.get_all_cars");
  // for (var i in cars) {
    var i = 0;
    cars[i].Features = cars[i].Features.join(",");
    cars[i].AlwaysAvailable = cars[i].AlwaysAvailable ? "true" : "false";
    cars[i].Confirm = cars[i].Confirm ? "true" : "false";
    console.log(cars[i].Email);
    api.run("this.create_update_car", cars[i]);
  // }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */