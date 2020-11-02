(params) => {
  let members = api.run("this.list_members");
  if (members.includes(params.email)) {
    return true;
  }
  let cars = api.run("this.list_cars")[0];
  for (var i in cars) {
    if (cars[i].Email === params.email) {
      return true;
    }
  }
  return false;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */