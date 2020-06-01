(params) => {
  if ("threadId" in params && params.threadId !== "") {
    let requests = api.run("this.list_requests");
    // look for the request to see if it needs to be updated
    let is_updated = false;
    for (var i in requests) {
      if (requests[i].threadId === params.threadId) {
        console.log (`updating ${params.threadId}`);
        requests[i] = params;
        is_updated = true;
      }
    }
    if (is_updated == false) {
      // append to the end:
      requests.push(params);
    }
  }
  return requests;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */