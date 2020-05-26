(params) => {
  const parameters = {};
  parameters.userId = 'me';
  parameters.$body = {
    labelIds : [ 'Car Requests' ],
    labelFilterAction : 'include',
    topicName : 'projects/carshare-265707/topics/requests'
  };
  return api.run('google_mail.set_push_notification', parameters);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */