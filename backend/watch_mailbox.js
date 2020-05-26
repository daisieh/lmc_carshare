(params) => {
  const parameters = {};
  parameters.userId = 'me';
  parameters.$body = {
    labelIds : [ '<string>' ],
    labelFilterAction : 'exclude | include',
    topicName : '<string>'
  };
  return api.run('google_mail.set_push_notification', parameters);
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */