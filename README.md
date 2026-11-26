# ReasonTrail Project Memory for Herdr

This public repository distributes ReasonTrail integrations. In addition to
the Herdr plugin below, the repository root contains a portable Agent Plugin
for Cursor-compatible clients and a Gemini CLI extension. The OpenAI
submission-specific package is under `integrations/ai-directories/`.

## AI client directory packages

| Client | Package | Distribution status |
| --- | --- | --- |
| Claude Software Directory | Hosted MCP endpoint `https://app.reasontrail.ai/api/mcp` | Claude Code 2.1.223 completed DCR and reached the production PKCE authorization URL with `brain:read` and `offline_access`; owner consent and authenticated tool calls remain pending. Directory submission is held on Anthropic policy fit. |
| ChatGPT and Codex | `integrations/ai-directories/openai-reasontrail/` | OpenAI DCR package draft; production discovery and DCR are live. Authenticated client checks and portal verification, reviewer account, terms, and demo remain outstanding. |
| Cursor | Repository root (`plugin.json`, `mcp.json`) | Portable Agent Plugin draft; client installation and Cursor review remain outstanding. |
| Gemini CLI | Repository root (`gemini-extension.json`) | Gemini CLI 0.71.1 `extensions validate` passes; earlier package installation and MCP listing passed without authentication. Live DCR, OAuth, and authenticated tool calls remain unverified; [upstream issue #29620](https://github.com/google-gemini/gemini-cli/issues/29620) reports DCR persistence and issuer-check problems. The root manifest is not on the default branch, so gallery discovery remains pending. |

The MCP service uses the connected user's ReasonTrail permissions. Model
selection and model billing remain with the client provider. These files are
distribution packages, not evidence that any directory has listed or approved
ReasonTrail. See [`docs/ai-directory/README.md`](docs/ai-directory/README.md)
and [`docs/ai-directory/LISTING_COPY.md`](docs/ai-directory/LISTING_COPY.md)
for requirements, drafts, and blockers.

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

Herdr discovers plugins from **public** GitHub repositories tagged with the `herdr-plugin` topic. This repository is public and already appears in Herdr's marketplace index. Indexing is automatic and may lag default-branch updates; it is not a security review, so users should inspect plugin source before installing.

The live index refreshed on 26 November 2026 at 03:00 UTC and now reports
ReasonTrail Project Memory 0.1.1 at default-branch commit `a11d5eccbaf0ca247d068dc36f0325f46a8a8e5d`. This verifies the existing Herdr listing update is published in discovery.

The current first slice deliberately contains no automatic lifecycle hooks. Add them only after validating exact Herdr event semantics and the ReasonTrail capture contract. Any future capture must remain explicit and governed; it must not pretend that an agent status event is a conversation transcript.

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE).
