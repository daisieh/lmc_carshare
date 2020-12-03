(params) => {
  let car = {};
  let keys = ["Timestamp", "Email address", "Make", "Model", "Color", "Tags", "Availability", "Confirmation", "Licence plate", "Notes"];
  for (var key in keys) {
    car[keys[key]] = params.sheet_row[key];
  }
  car.Features = car.Tags.split(", ");
  delete car.Tags;

  car.Licence = car["Licence plate"];
  delete car["Licence plate"];

  car.Email = car["Email address"];
  delete car["Email address"];

  if (car["Availability"] === "Only available at specified times") {
    car.AlwaysAvailable = false;
  } else {
    car.AlwaysAvailable = true;
  }
  delete car["Availability"];

  if (car["Confirmation"] === "Email me to confirm requests") {
    car.Confirm = true;
  } else {
    car.Confirm = false;
  }
  delete car["Confirmation"];
  
  if (car["Notes"] == null) {
    car.Notes = "";
  }

  car["Description"] = `${car.Color} ${car.Make} ${car.Model} ${car.Licence}`;
  return car;
}
