(params) => {
  let car = params.car_object;
  if (car == null || Object.keys(car).length == 0) {
    let keys = ["Timestamp", "Email address", "Make", "Model", "Color", "Tags", "Availability", "Confirmation", "Licence plate", "Notes", "Booking calendar", "Availability calendar"];
    return keys;
  }
  let row = [];
  
  row.push(car.Timestamp);
  row.push(car.Email);
  row.push(car.Make);
  row.push(car.Model);
  row.push(car.Color);
  row.push(car.Features.join(", "));
  row.push(car.AlwaysAvailable ? "Always available by default" : "Only available at specified times");
  row.push(car.Confirm ? "Email me to confirm requests" : "Automatically confirm requests");
  row.push(car.Licence);
  row.push(car.Notes);
  row.push(car.AvailableCalendar);
  row.push(car.BookingCalendar);

  return row;
}
