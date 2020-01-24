/**
 * This operation is an example of a JavaScript operation deployed as a Webhook
 * and configured to work with Slack.
 *
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/building/webhooks
 */
({ http_event }) => {
  const parsed_body = http_event.parsed_body;
  const workspaceId = parsed_body.team_id;
  const userId = parsed_body.user_id;

  setImmediate(() => {
    let user = api.user({type: "slack", workspaceId, userId});
    if (user) {
      let message = api.run('this.get_slack_message', {http_event}, {asUser: user.id})[0];
      api.run("slack_webhook.respond_to_slash_command", message);
      api.run()
    } else {
      let text = `Configure user settings at ${env.getBuiltin().appUrl}`;
      api.run("slack_webhook.respond_to_slash_command", { http_event, text });
    }
  });
  return api.run("slack_webhook.acknowledge_slash_command");
}

