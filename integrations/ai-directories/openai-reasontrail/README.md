# ReasonTrail Agent Plugin

Portable Agent Plugin package for the hosted ReasonTrail MCP service. It can be
installed by clients that support the Agent Plugins format, including Cursor;
OpenAI's directory review uses the metadata in `plugin.json`.

The server uses Streamable HTTP at `https://app.reasontrail.ai/api/mcp` and
OAuth 2.0 Authorization Code with PKCE. Clients should use the MCP 401
challenge and standard OAuth metadata discovery rather than a copied bearer
token. The hosted service must have the OAuth release deployed before sign-in
can work.

This package does not grant broader permissions than the signed-in ReasonTrail
account. Directory OAuth is limited to project read and governed capture
scopes; canonical project writes and runtime operations are unavailable.

## Files

- `plugin.json`: portable plugin manifest and OpenAI listing/review metadata.
- `mcp.json`: portable remote MCP server configuration.
- `skills/get-started/SKILL.md`: optional onboarding guidance.
- `assets/icon.svg`: listing icon.

## Local validation

Validate `plugin.json` against the Agent Plugins 1.0.0 schema. OpenAI's
documented `extensions.com.openai.auth` fields intentionally extend the closed
portable `mcp.json` schema; validate this file with OpenAI's submission portal
and the current OpenAI MCP authentication guidance. Cursor uses the separate
schema-valid package. Then complete the OAuth flow,
verify tool discovery, call one read tool, and verify that refresh-token
rotation works. A schema-valid package is not evidence of a live connection or
directory approval.

## Directory status

The public ReasonTrail Herdr repository carries the portable package at its
root; Cursor's official Marketplace still requires client installation tests
and manual review. OpenAI publication additionally requires publisher verification,
domain verification, a valid terms-of-service page, reviewer data, executed
review cases, and a walkthrough. Track these gates in
`../../../docs/ai-directory/README.md` in this repository.
