(params) => {
  let role = params.canWrite ? "writer" : "none";
  let ruleId = `user:${params.user}`;
  let rule = null;
  console.log(`looking for calendar ${params.calendarId}`);
  // look for an existing rule
  try {
    rule = api.run('google_calendar.get_acl_rule', 
                   { calendarId: params.calendarId,
                     ruleId: ruleId
                   })[0];
    console.log(rule);
  } catch (e) {
    console.log(e.message);
  }
  
  // rules shouldn't exist if there already wasn't access
  if (rule != null && !params.canWrite) {
    // if the rule exists and we're trying to set it to !canWrite, we should update it
    try {
      console.log(`updating rule for ${params.user}`);
      rule = api.run('google_calendar.update_acl_rule', 
                     { calendarId: params.calendarId,
                       ruleId: ruleId,
                       $body: {
                          role : role,
                          kind : 'calendar#aclRule',
                          scope : {
                            type : 'user',
                            value : params.user
                          }
                       }
                     });
    } catch (e) {
      console.log(e.message);
    }
  } else if (rule != null && params.canWrite) {
    console.log(Object.keys(rule));
    // if the rule exists and we want to write, make sure it's set correctly:
    console.log(`rule exists for ${params.user}: role is ${rule.role}`);
  } else if (rule == null && !params.canWrite) {
    // do nothing, because there doesn't need to be a rule for this.
    console.log(`no rule for ${params.user}, but there shouldn't be`);
  } else {
    // create a rule
    console.log(`creating rule for ${params.user}`);
    rule = api.run('google_calendar.create_acl_rule', 
                     { calendarId: params.calendarId,
                       sendNotifications: true,
                       $body: {
                          role : role,
                          kind : 'calendar#aclRule',
                          scope : {
                            type : 'user',
                            value : params.user
                          }
                       }
                     });
  }
  return rule;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */