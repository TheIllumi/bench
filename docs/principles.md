# Bench Principles

> These principles are the constitution of Bench.
>
> Every design decision, feature request, pull request, and
> architectural change must align with them.
>
> If implementation and documentation disagree, **the documentation
> wins** until intentionally revised.

------------------------------------------------------------------------

# Mission

Bench exists to reduce cognitive load.

It is not designed to maximize productivity.

It is designed to minimize the mental effort required to decide what
deserves attention next.

Our north star is simple:

> **Reduce the next decision.**

------------------------------------------------------------------------

# Product Principles

## 1. Reduce Cognitive Load

Every interaction should make the user's mental model simpler.

If a feature introduces unnecessary decisions, it does not belong.

------------------------------------------------------------------------

## 2. Focus Is Finite

Bench intentionally embraces human limitations.

Maximum: - 3 Focus Tasks - 5 Focus Projects

These are design constraints, not technical constraints.

------------------------------------------------------------------------

## 3. Opinionated Over Configurable

Every setting creates another decision.

Bench prefers excellent defaults over endless customization.

------------------------------------------------------------------------

## 4. Local First

Bench must function fully offline.

User data belongs to the user.

Cloud features, if they ever exist, must always be optional.

------------------------------------------------------------------------

## 5. Keyboard First

Primary workflows should never require the mouse.

Keyboard shortcuts are first-class citizens.

------------------------------------------------------------------------

## 6. Projects Are First-Class Citizens

Everything meaningful belongs to a Project.

Projects provide context.

Focus provides direction.

------------------------------------------------------------------------

## 7. Glanceability

Bench should answer one question within five seconds:

> What should I be working on right now?

------------------------------------------------------------------------

## 8. Calm Interface

Whitespace is a feature.

Animations should be subtle.

Decoration should never compete with information.

------------------------------------------------------------------------

## 9. Organizing Should Never Become Work

Capturing information should take seconds.

Returning to work should be immediate.

------------------------------------------------------------------------

## 10. Build Less

Every feature must justify its existence.

Removing complexity is as valuable as adding functionality.

------------------------------------------------------------------------

# Engineering Principles

## Documentation is the Source of Truth

Conversations are drafts.

Ideas become real only after documentation is updated.

When code and documentation disagree, documentation wins until
intentionally changed.

------------------------------------------------------------------------

## Strive for Consistency

One concept.

One name.

Documentation, UI, code, issues, commits, and discussions should all use
the same vocabulary.

------------------------------------------------------------------------

## Derived State Should Never Be Stored

If something can be calculated, calculate it.

Examples:

-   Focus = Tasks where `focused == true`
-   Focused Projects = Projects where `state == Focused`

Duplication creates bugs.

------------------------------------------------------------------------

## Stable Identity

Entity IDs are immutable.

Names may change.

States may change.

IDs never change.

------------------------------------------------------------------------

## The UI Is Temporary

The data model is forever.

UI frameworks may change.

Storage engines may change.

The domain model should remain stable.

------------------------------------------------------------------------

# Values

-   Clarity
-   Calm
-   Intentionality

These values should guide every design discussion.

------------------------------------------------------------------------

# The Bench Test

Before adding any module, ask:

1.  Does it reduce cognitive load?
2.  Does it reduce the next decision?
3.  Will it be used regularly?
4.  Can it be explained in one sentence?
5.  Would Bench feel incomplete without it?

If any answer is "No", don't build it.

------------------------------------------------------------------------

# Definition of Success

Bench succeeds when opening the application immediately provides clarity
instead of creating more work.

If Bench becomes something users manage instead of something that
quietly helps them work, Bench has failed.
