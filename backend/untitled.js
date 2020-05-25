(params) => {
  let this_car = api.run("this.get_car", {vehicle: params.car_email})[0];
  if (this_car.Confirm && params.confirmed == null) {
    //send an email
    console.log("send an email");
  } else {
    console.log("make the request");
  }
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */