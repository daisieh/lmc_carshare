(params) => {
  if (stash.get("forms_label") == null) {
    let labels = api.run('google_mail.list_labels', {userId: 'me'})[0].labels;
    for (var i in labels) {
      if ("name" in labels[i] && labels[i].name === 'Form Responses') {
        stash.put("forms_label", labels[i].id);
      }
    }
  }
  let label = stash.get("forms_label");

  const parameters = {};
  parameters.userId = 'me';
  parameters.$body = {
    labelIds: [label],
    topicName : 'projects/carshare-265707/topics/requests'
  };
  let result = api.run('google_mail.set_push_notification', parameters);
  stash.put("gmail_watch", result);

  
  result = api.run('google_mail.list_messages', {userId: 'me', labelIds: [label]});
  stash.put("gmail_history", result);


  return result;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */