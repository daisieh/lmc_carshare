(params) => {
  const parameters = {};
  //parameters.userId = 'me';
  //return api.run('google_mail.list_labels', parameters);
  //const parameters = {};
  parameters.userId = 'me';
  parameters.$body = {
    labelIds : [ 'Label_3087422522999134978' ],
    labelFilterAction : 'include',
    topicName : 'projects/carshare-265707/topics/requests'
  };
  let result = api.run('google_mail.set_push_notification', parameters);
  stash.put("historyId", result[0].historyId);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */