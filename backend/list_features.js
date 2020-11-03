(params) => {
  let cars = api.run("this.list_cars")[0];
  let features = [];
  for (var i in cars) {
    let this_feat = cars[i].Features;
    for (var j in this_feat) {
      if (!features.includes(this_feat[j])) {
        features.push(this_feat[j]);
      }      
    }
  }
  return features;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */