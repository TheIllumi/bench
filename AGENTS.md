# AGENTS.md

> **AI Engineering Constitution**
>
> This document defines how AI agents should contribute to Bench.
>
> It is intentionally vendor-neutral.
> These principles apply to any AI system capable of generating or modifying code.

---

# Purpose

Bench is developed using **Documentation-Driven Development (DDD)** and **AI-Assisted Software Engineering**.

AI exists to accelerate implementation.

Humans remain responsible for product vision, architectural decisions, and final approval.

AI should never invent Bench.

AI should faithfully implement Bench.

---

# The Mission

Your objective is simple:

Implement the documented product.

Nothing more.

Nothing less.

Bench is intentionally opinionated.

Do not optimize for "more features."

Optimize for simplicity, clarity, and maintainability.

---

# Authority

When multiple documents exist, follow them in this order.

1. README.md
2. docs/principles.md
3. docs/terminology.md
4. docs/prd.md
5. docs/data-model.md
6. docs/architecture.md
7. docs/ui-guidelines.md
8. docs/code-style.md
9. docs/decisions/
10. BUILD.md
11. CONTRIBUTING.md

Lower-priority documents must never contradict higher-priority documents.

If they appear to, stop and ask for clarification.

---

# Fundamental Rules

## Documentation Wins

Documentation defines the product.

Code implements the documentation.

Conversation is not documentation.

Ideas discussed in chat remain proposals until intentionally documented.

Never implement undocumented behavior.

---

## Ask Instead of Guess

If requirements are ambiguous:

Stop.

Explain the ambiguity.

Ask for clarification.

Never silently make product decisions.

Incorrect certainty is worse than delayed implementation.

---

## Protect the Domain

The Domain is the heart of Bench.

Never introduce UI concepts into the Domain layer.

The Domain must remain independent of:

- HTML
- CSS
- JavaScript frameworks
- Tauri
- Storage engines

The UI depends on the Domain.

The Domain never depends on the UI.

---

## Respect Product Constraints

Bench intentionally limits user choice.

These are product decisions.

Do not remove or weaken them.

Current constraints include:

- Maximum 3 Focus Tasks
- Maximum 5 Focus Projects
- Local-first architecture
- Keyboard-first workflows
- Documentation-first development

These constraints exist to reduce cognitive load.

---

## Simplicity Is a Feature

When multiple implementations satisfy the requirements:

Choose the simplest one.

Prefer:

- fewer files
- fewer abstractions
- readable code
- explicit logic

Avoid:

- unnecessary design patterns
- premature optimization
- clever code
- speculative architecture

---

## Never Invent Features

Do not add:

- AI functionality
- cloud synchronization
- notifications
- calendars
- analytics
- settings
- animations
- plugins
- themes
- configuration options

unless explicitly documented.

Feature creep is considered a defect.

---

# Code Generation Standards

Generated code should be:

- Small
- Readable
- Predictable
- Modular
- Well named
- Consistent

Functions should:

- Do one thing.
- Be easy to test.
- Avoid hidden side effects.

---

# State Management

Bench uses a single source of truth.

Do not duplicate state.

Derived state should be calculated.

Examples:

Focus

↓

Tasks where `focused == true`

Never persist derived state.

---

# Error Handling

During development:

Fail loudly.

During production:

Fail gracefully.

Never silently ignore errors.

Protect user data whenever possible.

---

# Dependencies

Before introducing a dependency, ask:

Does the standard library already solve this?

Does existing project code already solve this?

Does this dependency significantly reduce complexity?

If not,

do not add it.

Bench values a small dependency graph.

---

# Refactoring

Refactoring is encouraged when it:

- reduces complexity
- improves readability
- removes duplication
- better aligns implementation with documentation

Do not refactor purely for personal preference.

---

# Pull Request Checklist

Before considering work complete:

- Documentation still matches implementation.
- No undocumented behavior exists.
- Naming follows `docs/terminology.md`.
- Code follows `docs/code-style.md`.
- No duplicated state was introduced.
- Product constraints remain intact.
- The project builds successfully.

---

# The Bench Test

Before implementing any feature, ask:

1. Does it reduce cognitive load?
2. Does it reduce the next decision?
3. Does it align with the Principles?
4. Is it documented?
5. Is it simpler than the alternatives?

If any answer is "No",

stop and ask.

---

# The Anti-Goals

Bench should never become:

- Notion
- ClickUp
- Jira
- Trello
- A CRM
- A habit tracker
- A time tracker
- A team collaboration suite

Do not optimize toward these products.

Optimize toward Bench.

---

# Philosophy

The best AI contribution is not the one that writes the most code.

It is the one that writes the least code necessary to faithfully implement the documented product.

---

# Final Principle

When uncertain:

Do not invent.

Do not assume.

Do not optimize prematurely.

Read the documentation.

Then ask.

Bench values deliberate engineering over fast engineering.