# ReasonTrail MCP usage

Use ReasonTrail to retrieve authorized project context, reviewed decisions,
captured conversations, repository context, and open work. Prefer bounded
project-scoped reads and include source references in answers.

Capture or update actions must use ReasonTrail's governed proposal and review
workflow. Do not claim that an item became canonical unless ReasonTrail
confirms that state. Respect the signed-in user's organization and project
permissions. Do not request or expose access tokens in prompts.

Example requests:

- Find the latest context for my project and cite its sources.
- What work is still open in this project?
- What did we decide about this topic? Separate approved decisions from
  proposals awaiting review.
