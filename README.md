# ReasonTrail Project Memory for Herdr

This Herdr TUI plugin connects a workspace to one explicitly selected ReasonTrail project. It reuses the ReasonTrail CLI and remote MCP endpoint; it does not create another backend or copy project credentials into Herdr.

## What it does

- **Fetch project context**: an explicit Herdr action asks ReasonTrail for bounded context using the current workspace directory and the project slug in the local plugin config.
- **Submit a handover**: an interactive popup asks for a title and short summary, then asks before sending it to ReasonTrail as a governed update. Findings and remaining work are proposals for review.

The plugin does not automatically read agent terminals, capture chats, or submit summaries in the background. Herdr does not expose a complete native conversation transcript through plugin context, so this integration does not claim transcript capture. Classification changes are intentionally out of scope.

## Install from a checkout

Requirements: Herdr 0.9.0 or newer, Node.js 20+, and a ReasonTrail project account.

```bash
herdr plugin link /path/to/reasontrail/integrations/herdr
herdr plugin config-dir ai.reasontrail.project-memory
```

Copy `config.example.json` to the printed config directory as `config.json`. Set `projectSlug` to the exact ReasonTrail project. Production access requires the explicit `confirmProduction: true` setting; the plugin still makes no request until an action is invoked. Use `development` only with a locally configured development profile.

Install the ReasonTrail CLI dependency and authenticate with the profile from the config:

```bash
cd /path/to/reasontrail/integrations/herdr
npm ci --ignore-scripts
node node_modules/@reasontrail/cli/bin/reasontrail.mjs config endpoint https://app.reasontrail.ai/api/mcp --profile production
node node_modules/@reasontrail/cli/bin/reasontrail.mjs auth login --device --profile production
```

The CLI stores only its ReasonTrail access token through its supported local credential store. This is separate from provider passwords stored as ReasonTrail project credentials; the plugin never reads or handles those provider secrets. Do not add tokens or passwords to `config.json`.

Restart or reload Herdr after linking, then check the action and open the handover pane:

```bash
herdr plugin action list --plugin ai.reasontrail.project-memory
herdr plugin action invoke context --plugin ai.reasontrail.project-memory
herdr plugin pane open --plugin ai.reasontrail.project-memory --entrypoint handover
```

## Marketplace distribution

Herdr discovers plugins from **public** GitHub repositories tagged with the `herdr-plugin` topic. This repository is public and already appears in Herdr's marketplace index. Indexing is automatic and is not a security review, so users should inspect the plugin source before installing.

The current first slice deliberately contains no automatic lifecycle hooks. Add them only after validating exact Herdr event semantics and the ReasonTrail capture contract. Any future capture must remain explicit and governed; it must not pretend that an agent status event is a conversation transcript.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
