(params) => {
  //return api.run('google_mail.stop_push_notifications', {userId: 'me'});
  const parameters = {};
  parameters.userId = 'me';
  parameters.$body = {
    labelIds : [ 'Label_3087422522999134978' ],
    //labelFilterAction : 'include',
    topicName : 'projects/carshare-265707/topics/requests'
  };
  let result = api.run('google_mail.set_push_notification', parameters);
  stash.put("historyId", result[0].historyId);
  return result;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */