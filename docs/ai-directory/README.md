# AI directory submission readiness

This document tracks the hosted ReasonTrail MCP connection intended for Claude,
ChatGPT and other OAuth-capable MCP clients. These checklists do not imply that
any directory has approved or published ReasonTrail. Client directories have
different scopes: Claude Software Directory, OpenAI Plugins Directory, Gemini
CLI extension gallery, Cursor Marketplace, and VS Code's preview marketplace
are separate publication paths.

## Hosted endpoints

- MCP (Streamable HTTP): `https://app.reasontrail.ai/api/mcp`
- Protected Resource Metadata: `https://app.reasontrail.ai/.well-known/oauth-protected-resource/api/mcp`
- Authorization Server Metadata: `https://app.reasontrail.ai/.well-known/oauth-authorization-server`
- OAuth registration: `https://app.reasontrail.ai/oauth/register`
- OAuth authorization: `https://app.reasontrail.ai/oauth/authorize`
- OAuth token and refresh: `https://app.reasontrail.ai/oauth/token`
- OAuth revocation: `https://app.reasontrail.ai/oauth/revoke`

**Live status checked 25 November 2026:** the deployed host returned HTTP 404
for the OAuth authorization-server metadata, protected-resource metadata,
registration, and token routes. The changes in this checkout are not deployed,
so neither Claude nor ChatGPT can complete OAuth against the current hosted
service yet.

Only public OAuth clients are accepted. Authorization Code + PKCE S256 is
required. Users explicitly approve the ReasonTrail organization and scopes.
`brain:read` and `brain:capture` are available; `brain:write` and
`brain:runtime` are withheld from directory OAuth clients. Access tokens last
one hour. `offline_access` issues a rotating refresh token for 90 days. Every
MCP request still rechecks the user's active membership and token permissions.

## Claude directory

**Policy fit is unresolved; do not submit the current shared MCP surface.**
ReasonTrail's general OAuth listing requests `brain:capture`, whose tools can
store submitted conversation turns and make reviewed project knowledge
available to later sessions. Anthropic's current [Software Directory
Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)
section 1.G prohibits persistently storing or using conversation content to
build user profiles or change Claude's behavior across sessions. OAuth
compatibility by itself does not establish directory-policy compatibility.

The current listing draft advertises conversation capture, so it is not ready
for Anthropic review. A Claude-specific surface would need a verified policy
design that does not persist or reuse Claude conversation content; the effect
of returning existing ReasonTrail knowledge to Claude also needs careful review
against that policy. Do not claim compliance or submit until that product scope
is resolved and the resulting implementation is tested. If the cross-session
memory workflow cannot be separated from Claude, do not seek Anthropic
directory inclusion without written guidance from Anthropic.

If a policy-cleared scope is approved, Anthropic's current directory portal
accepts a single remote MCP connector. The authorized publisher must create the
submission, complete OAuth/domain verification, scan all tools, resolve
automated findings, provide the privacy-policy URL and support details, then
submit for review. Anthropic also requires a standard testing account with
sample data, at least three working prompts/use cases, and verified contact
and support details.

Anthropic's [Software Directory Terms](https://support.claude.com/en/articles/13145338-anthropic-software-directory-terms)
include publisher representations about rights, law and policy compliance,
privacy disclosures, and an indemnity. Only the authorized ReasonTrail
publisher should review and accept those terms; the code or draft listing does
not constitute acceptance. Approval and publication are separate steps after
submission.

Directory policy requires secure OAuth 2.0 for authenticated remote MCP servers
and applicable tool annotations. The server implements OAuth discovery and
returns `title`, `readOnlyHint`, and `destructiveHint` on each tool. The live
Anthropic scan and review have not yet been run. See
[listing copy and review prompts](./LISTING_COPY.md) for prepared text.

## ChatGPT / Codex Plugins Directory

OpenAI's shared Plugins Directory publishes integrations for ChatGPT and Codex.
The remote MCP endpoint is submitted through the portal's With MCP flow, with
the plugin ZIP supplying listing and review metadata. The OpenAI [package and
authentication guidance](https://developers.openai.com/plugins/build/plugins)
documents server auth in `mcp.json`, OAuth DCR, and `baseScopes`; the current
server also advertises OAuth `securitySchemes` per tool as required by the
[authentication guide](https://developers.openai.com/plugins/build/auth).
The OpenAI package at
`integrations/ai-directories/openai-reasontrail/` uses OpenAI's documented
`extensions.com.openai.auth` declaration for OAuth DCR and requests
`brain:read`, `brain:capture`, and `offline_access`. This OpenAI extension is
not part of the closed portable Agent Plugins 1.0.0 MCP schema. The repository
root `plugin.json` and `mcp.json` preserve the schema-valid portable setup and
rely on standard OAuth discovery for Cursor. ChatGPT's listing portal must
still verify the DCR flow and refresh-token renewal against the deployed
service.

The owner still needs to supply and verify:

- Developer identity and publisher verification in OpenAI's portal.
- Completed, accurate terms of service. The current
  [terms page](https://reasontrail.ai/terms) expressly says it is an
  availability notice, not a terms-of-service agreement; it must not be
  submitted as the required terms URL.
- A dedicated reviewer account and test organization with sample data.
- Five positive and three negative test cases run against that account. The
  package has draft cases; they have not been executed and are not submission
  evidence.
- An accessible product walkthrough recording.
- A successful domain-verification challenge and current portal MCP tool scan.
- Current privacy policy, support contact, screenshots and release notes.

Do not include credentials or reviewer secrets in the plugin ZIP or repository.

## Submission review cases

Prepare and execute these against a dedicated non-production reviewer tenant.

### Positive cases

1. Ask Claude/ChatGPT to find the current project objective; expect authorized
   project discovery and bounded context retrieval.
2. Ask what is pending in one named project; expect only that user's authorized
   tasks and project records.
3. Ask what the team decided about one named topic; expect approved decisions
   with provenance and pending proposals clearly distinguished.
4. Ask to record a new decision; expect a governed proposal, not a canonical
   decision mutation.
5. Refresh an expired access token; expect the old refresh token to be unusable
   and the rotated token to work until revoked or expired.

### Negative cases

1. Attempt a project outside the user's membership; expect no cross-tenant data.
2. Attempt canonical task creation/update through a directory OAuth token;
   expect the server to deny the out-of-scope tool.
3. Replay an authorization code or rotated refresh token; expect `invalid_grant`
   and no additional credential issuance.

These are test plans until execution evidence is recorded. Anthropic also
requires three working prompts and a test account. The actual directory review
may require edits or additional materials.

## Migration and rollback

The additive migration creates OAuth client, authorization-code and refresh-token
tables and adds optional OAuth client, grant, and resource bindings to
`McpAccessToken`. Existing personal access tokens and organization permissions are unchanged. Deploy the
migration before application code that serves OAuth routes. Back up the
database using the production backup runbook. Rollback by deploying the prior
application release; retain the additive tables and nullable token column until
all OAuth clients have been revoked and the rollback window has passed. Do not
drop OAuth data as part of an application rollback.

## Gemini CLI extension gallery

The repository root `gemini-extension.json` configures the ReasonTrail remote
MCP endpoint over HTTP streaming and relies on Gemini CLI's OAuth discovery,
dynamic registration, and token lifecycle support. The extension still needs
a real Gemini CLI connection test against a deployed OAuth release.

The [official gallery publishing guide](https://geminicli.com/docs/extensions/releasing/)
indexes public GitHub repositories tagged `gemini-cli-extension` when the
extension manifest is at repository root. Gemini CLI's [remote MCP OAuth
support](https://geminicli.com/docs/tools/mcp-server/) documents metadata
discovery, dynamic client registration, and token management. The
existing public [ReasonTrail Herdr repository](https://github.com/joaquimpsoares/reasontrail-herdr)
is Apache-2.0 licensed and owner-administered. This distribution branch adds
the Gemini manifest at root; the change must be merged and the
`gemini-cli-extension` topic added before gallery indexing can find it. The
existing topic `herdr-plugin` remains intact.

## Cursor Marketplace

The portable Agent Plugin at the repository root uses the closed Agent Plugins
1.0.0 MCP schema and standard OAuth discovery. This draft adds it to the public
repository; the manifest must be merged and locally tested. Cursor Marketplace
submission
requires a public Git repository, open-source source, local installation
testing, and manual Cursor review, as described in the [Cursor plugin
reference](https://prod.cursor.com/docs/reference/plugins). Cursor supports
the Agent Plugins standard documented in its [plugin guide](https://cursor.com/docs/plugins).
The source is public, but the package still requires local client testing and
Cursor's manual review before it can be listed.

## VS Code and GitHub Copilot

VS Code can connect to remote MCP over HTTP and documents OAuth sign-in and
standard metadata discovery in its [MCP configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration).
The currently documented Customization
Marketplace/GitHub Feed is experimental and availability depends on the
selected Copilot harness and organization policy. Users can still add the
ReasonTrail endpoint directly and authenticate through OAuth after deployment.
There is no stable publisher submission pathway established here, and no
listing should be claimed. Verify first in the intended Copilot harness using
the low-impact call procedure in the Microsoft documentation.

## Supported-client status

| Client / channel | Package or setup | OAuth compatibility | Live verified | Official listing |
| --- | --- | --- | --- | --- |
| Claude Software Directory | No policy-cleared endpoint yet; current shared endpoint includes capture | OAuth 2.0, PKCE, discovery implemented locally | No; hosted OAuth routes were 404 on 25 Nov 2026 | Blocked on Anthropic policy fit and live validation |
| ChatGPT / Codex Plugins Directory | Portable Agent Plugin | OAuth discovery/DCR; portal handshake still needs confirmation | No | Not submitted |
| Gemini CLI gallery | Root `gemini-extension.json` | Gemini documents OAuth discovery, DCR and refresh | No | Root manifest in draft branch; merge, topic, test and gallery indexing pending |
| Cursor Marketplace | Root Agent Plugin | Cursor supports MCP with OAuth | No | Root package in draft branch; merge, local test and review pending |
| VS Code / Copilot | Direct remote MCP setup | OAuth supported in Copilot configuration | No | Marketplace is experimental; no publisher path confirmed |

“OAuth compatibility” above describes documented client capability and the
implemented server protocol, not a completed live handshake. Refresh this
table after deployment and per-client tool-call verification.
