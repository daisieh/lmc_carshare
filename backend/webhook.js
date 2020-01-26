/**
 * This operation is an example of a JavaScript operation deployed as a Webhook
 * and configured to work with Slack.
 *
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */
({ http_event }) => {
  const parsed_body = http_event.parsed_body;
  

  setImmediate(() => {
    let message = api.run('this.get_slack_message', {http_event})[0];
    api.run("slack_webhook.respond_to_slash_command", message);
  });
  return api.run("slack_webhook.acknowledge_slash_command");
}

