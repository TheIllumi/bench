# ADR 0004 --- Local First

**Status:** Accepted

## Context

Bench is intended to be fast, private, and always available.

## Decision

Bench is local-first.

The application must function fully offline.

Cloud functionality, if ever introduced, must remain optional and must
not become a dependency for the core experience.

## Consequences

-   Fast startup
-   Offline availability
-   User ownership of data
-   Simpler architecture for the MVP
