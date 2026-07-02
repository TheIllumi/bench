# ADR 0001 --- Documentation Is the Source of Truth

**Status:** Accepted

## Context

Bench is developed using AI-assisted software engineering. Conversations
are useful for brainstorming, but they are not durable. Without a single
source of truth, implementation drifts.

## Decision

Documentation is the authoritative definition of Bench.

Ideas discussed in conversation remain proposals until they are
intentionally documented.

If implementation and documentation disagree, implementation must be
updated or the documentation must be intentionally revised through a new
ADR.

## Consequences

### Positive

-   Consistent development
-   Easier onboarding
-   Reduced feature creep
-   Better AI collaboration

### Negative

-   Slightly slower planning
-   Requires documentation discipline

> Documentation is the source of truth. Conversations are drafts.
