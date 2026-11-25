# Security notes

- Herdr plugins are ordinary executable programs running with the installing user's permissions. Review the code before installing.
- This plugin invokes the Herdr CLI for the current workspace snapshot and the ReasonTrail CLI for explicit context or handover actions.
- Do not put tokens, passwords, API keys, or provider secrets in plugin config or handover text.
- Context retrieval and handover submission require explicit user invocation. Handover submission includes an additional confirmation prompt.
- Provider credential operations and approvals are outside this plugin's scope.
- Report security issues privately to the ReasonTrail maintainers; do not include credentials or sensitive project data in public issues.
