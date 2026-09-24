# 3. Embedded Chat for Discussing Assignment Data

Date: 2026-09-24

## Status

Proposed

## Context

The app tracks assignments with links, technologies, skill-match and interest scores, a status
(Considering / Applied / Dropped / Accepted / Rejected / Declined), and free-text notes. As this
data set grows, the user wants to be able to ask open-ended questions about it — e.g. "which
skills come up most in assignments I rated highly for interest but low for skill match?" or
"summarize what I've learned from assignments I declined" — without exporting the data and
pasting it into a separate chat session.

This ADR proposes an approach for embedding a chat interface directly in the frontend that lets
the user discuss their stored assignment data with Claude. It is a plan for future work, not
something implemented alongside this ADR.

Constraints that shape the design:

- The app currently has no authentication and runs as a single-user local tool (see ADR 0001).
  A chat feature should not force multi-user auth to be built first, but must not casually
  introduce a way for arbitrary third parties to spend the user's API budget if the app is ever
  exposed beyond `localhost`.
- The Anthropic API key must never reach the browser. All calls to the Claude API have to be
  proxied through the backend.
- The data set is small (a personal list of assignments, likely low hundreds of rows at most),
  so there's no need for retrieval/embedding infrastructure — the full data set can be included
  in the prompt context directly.

## Decision

Add a chat feature built from three pieces:

1. **Backend chat endpoint.** A new `POST /api/chat` endpoint on the Spring Boot backend accepts
   a user message (and, for multi-turn conversations, prior turns), fetches all assignments from
   `AssignmentRepository`, serializes them into the request as context, and calls the Claude API
   (Messages API) server-side using an API key read from an environment variable /
   `application.properties`-style secret (never committed, never sent to the client). The
   endpoint returns Claude's reply to the frontend. This keeps the API key server-side and lets
   the backend control exactly what data is shared.

2. **Tool use for freshness, if the data set outgrows "always inline the whole table."** Initially,
   inlining the full assignment list as context on every request is simplest and cheapest to
   build, and is fine at this data scale. If the data set grows large enough that this becomes
   wasteful, the endpoint can evolve to give Claude a tool (e.g. `list_assignments`,
   `get_assignment(id)`) via the Messages API's tool-use feature instead of inlining everything,
   so Claude fetches only what it needs. This is a follow-up, not part of the initial
   implementation.

3. **Frontend chat widget.** A collapsible chat panel (e.g. docked to the bottom-right of the
   page, opened via a floating button) with a message list and input box, calling the new
   `/api/chat` endpoint and rendering streamed or complete responses. It holds conversation
   history in component state only (not persisted), so refreshing the page starts a new
   conversation. Persisting chat history is a possible future enhancement, not part of the
   initial scope.

The chat is read-only with respect to the assignment data: it can discuss and summarize
assignments but does not (initially) let Claude create, update, or delete them. Read-only scope
avoids building confirmation flows for destructive/mutating actions triggered from a chat
interface, which is a larger design problem (how does the user review and approve a bulk edit
proposed in chat?) best deferred until read-only chat has proven useful.

## Consequences

- Introduces a new external dependency (network calls to the Claude API) and an associated cost
  per chat message, whereas the rest of the app currently has no runtime external dependencies
  or per-request cost.
- Requires secret management for the Anthropic API key (environment variable or local config
  file excluded from version control) where previously the app had no secrets to manage.
- Inlining the full assignment list on every chat turn is simple but means prompt size — and
  cost — grows with the size of the user's assignment list. This is acceptable at current and
  expected scale but is the first thing to revisit if the data set grows substantially (see tool
  use above).
- Keeping the chat read-only avoids the harder problem of safely applying model-proposed edits to
  the data, at the cost of the chat not being able to act on the user's behalf (e.g. "mark this
  one as Dropped" would require the user to make that edit themselves in the table).
- No conversation persistence in the initial version means chat context is lost on page refresh;
  this is a reasonable initial trade-off for a personal tool but should be revisited if the chat
  proves useful enough that losing history becomes a recurring annoyance.
