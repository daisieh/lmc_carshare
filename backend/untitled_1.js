(params) => {
  let role = params.canWrite ? "writer" : "none";
  let ruleId = `user:${params.user}`;
  let rule = null;
  try {
    rule = api.run('google_calendar.get_acl_rule', 
                   { calendarId: params.calendarId,
                     ruleId: ruleId
                   });
  } catch (e) {
    if (e.message.includes("404: Not Found")) {
      try {
        rule = api.run('google_calendar.create_acl_rule', 
                       { calendarId: params.calendarId,
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
    } else {
      console.log(e.message);
    }
  }
  if (rule != null) {
    try {
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
  }
  return rule;
}

/*
 * For sample code and reference material, visit
 * https://www.transposit.com/docs/references/js-operations
 */