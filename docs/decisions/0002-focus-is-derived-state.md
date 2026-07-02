# ADR 0002 --- Focus Is Derived State

**Status:** Accepted

## Context

An early design considered storing Focus as its own entity.

## Decision

Focus is **not** an entity.

Focus is a module that presents Tasks where `focused == true`.

Focused Projects are Projects where `state == Focused`.

## Rationale

-   Eliminates duplicate data
-   Prevents synchronization bugs
-   Keeps the domain model simple
-   Aligns with the principle: *If something can be derived, it should
    not be stored.*

## Consequences

The Focus module owns no persistent data.
