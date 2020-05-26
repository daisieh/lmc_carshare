(params) => { 
  const parameters = {};
  parameters.to = params.requester;
  parameters.subject = 'Your car has been requested';
  parameters.message = `${params.uuid}`;
  parameters.contentType = "text/html";
  parameters[`from`] = 'lmc.carshare@gmail.com';
  parameters.userId = 'me';
  return api.run('google_mail.send_message', parameters);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */
