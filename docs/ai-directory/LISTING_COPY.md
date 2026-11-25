# ReasonTrail AI directory listing copy

Prepared draft text for Anthropic's Claude Software Directory and OpenAI's
shared ChatGPT/Codex Plugins Directory. This is copy, not proof of approval,
live compatibility, publisher ownership verification, or test completion.

## Claude

**Status: blocked draft. Do not submit this copy yet.** The current shared MCP
endpoint includes conversation-capture tools. Anthropic's current Software
Directory Policy section 1.G restricts persistent storage or cross-session use
of Claude conversation content. See the policy-fit gate in
[`README.md`](./README.md). The endpoint, tools, listing language, and intended
cross-session behavior need a Claude-specific design and policy review before
this can become submission copy.

**Name:** ReasonTrail

**One-line description:** Project context, decisions, and open work with source
references.

**Proposed description (not approved for submission):** ReasonTrail gives
Claude scoped access to reviewed project decisions, tasks, and repository
context from your ReasonTrail account. Results follow your organization and
project permissions and include source references where available. This copy
intentionally does not advertise Claude conversation capture. Claude uses your
Claude account for model access; ReasonTrail does not choose or pay for the
model. Confirm that even this retrieval-only product behavior fits Anthropic's
current policy before use.

**Three example prompts**

1. Find the latest context for my project and show the sources.
2. What work is still open in this project?
3. What did we decide about this topic? Show the approved decision and its
   source references.

**Proposed connection (not policy-cleared):** `https://app.reasontrail.ai/api/mcp` using OAuth 2.0
Authorization Code with PKCE S256 over Streamable HTTP.

**Privacy:** `https://reasontrail.ai/privacy`

**Support:** `support@reasontrail.ai` and `https://reasontrail.ai/early-access`

**Testing:** A dedicated Anthropic reviewer account and sample project data
must be provisioned. No reviewer credentials are included here.

## ChatGPT and Codex

**Display name:** ReasonTrail

**Short description:** Project context with sources.

**Long description:** ReasonTrail gives ChatGPT and Codex scoped access to
reviewed project knowledge, decisions, tasks, conversations, and repository
context. Access follows your existing ReasonTrail organization and project
permissions. Captured knowledge enters ReasonTrail's review process; the
integration does not directly change canonical project decisions or tasks.
OpenAI clients use your existing OpenAI account for model access; ReasonTrail
does not choose or pay for the model.

**Starter prompts**

- Find the latest context for my project and cite its sources.
- What decisions have we made about this topic?
- Capture this conversation as a proposal for review.

**Listing links**

- Website: `https://reasontrail.ai`
- Support: `https://reasontrail.ai/early-access`
- Privacy: `https://reasontrail.ai/privacy`
- Terms of service: **BLOCKED** — the current `/terms` page explicitly says it
  is not a terms-of-service agreement.

**Review cases:** Five positive and three negative draft cases are in
`../../integrations/ai-directories/openai-reasontrail/plugin.json`. They must
all be run against a dedicated test tenant before submission.

**Demo recording:** **BLOCKED** — no reviewer-accessible recording exists yet.

## Submission gates

Do not submit either listing until its current portal requirements are met:

- Deploy the OAuth migration and application code, then verify registration,
  consent, code exchange, refresh rotation/replay revocation, resource binding,
  and token revocation against the live service.
- Complete Anthropic and OpenAI domain verification and their live tool scans.
- Create test tenants with representative sample data and execute the required
  review prompts.
- Obtain publisher verification and complete each directory's attestations.
- Complete and publish accurate terms of service before setting an OpenAI
  `termsOfServiceURL`.
- Review the privacy policy for explicit collection, use, and retention details
  that accurately cover hosted ReasonTrail and third-party AI-client access.
  The current policy does not state category-specific retention periods, and
  app retention classification is informational rather than automatic deletion.
  Retrieved content may also be retained by the connecting AI client.
- Record a product walkthrough and provide its accessible URL for OpenAI.

The current hosted app's response and local tests do not substitute for these
gates.
