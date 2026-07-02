# Code Style Guide

> Code is read far more often than it is written.

This document defines how code should be written in Bench.

------------------------------------------------------------------------

# Philosophy

Write code for the next developer.

That developer may be:

-   Future you
-   An open-source contributor
-   An AI agent

Optimize for readability over cleverness.

------------------------------------------------------------------------

# Core Principles

-   Simplicity over abstraction
-   Explicit over implicit
-   Small modules over large files
-   Composition over inheritance
-   One responsibility per file

------------------------------------------------------------------------

# Naming

## Files

-   kebab-case

Examples:

-   project-card.js
-   focus-view.js

## Variables

camelCase

Use descriptive names.

Avoid abbreviations.

## Functions

Use verbs.

Examples:

-   createProject()
-   archiveTask()
-   loadWorkspace()

## Constants

UPPER_SNAKE_CASE only for true constants.

------------------------------------------------------------------------

# Folder Organization

Each folder owns one concern.

src/ - components/ - modules/ - domain/ - services/ - storage/ - utils/

Avoid dumping miscellaneous files into utils.

------------------------------------------------------------------------

# Functions

Keep functions:

-   Small
-   Pure where practical
-   Single responsibility

Prefer early returns.

Avoid deep nesting.

------------------------------------------------------------------------

# Comments

Write comments explaining **why**, not **what**.

Delete commented-out code.

------------------------------------------------------------------------

# Error Handling

Never silently swallow errors.

Development: - Fail loudly.

Production: - Recover gracefully when possible.

------------------------------------------------------------------------

# State

One source of truth.

Avoid duplicated state.

Derived state should be computed.

------------------------------------------------------------------------

# Imports

-   Standard library
-   Third-party
-   Internal modules

Keep ordering consistent.

------------------------------------------------------------------------

# Components

One component.

One responsibility.

Avoid components exceeding \~300 lines unless justified.

------------------------------------------------------------------------

# Commits

Follow Conventional Commits.

Examples:

-   feat:
-   fix:
-   docs:
-   refactor:
-   chore:
-   test:

Keep commits focused.

------------------------------------------------------------------------

# Branches

Examples:

-   feature/focus-module
-   fix/sidebar-scroll
-   docs/principles-update

------------------------------------------------------------------------

# Anti-Patterns

Avoid:

-   God objects
-   Hidden side effects
-   Circular dependencies
-   Premature optimization
-   Over-engineering

------------------------------------------------------------------------

# The Bench Way

Before merging code, ask:

-   Is this simpler?
-   Is this more readable?
-   Does it align with the documentation?
-   Would a new contributor understand it?

If not, improve it before merging.

------------------------------------------------------------------------

# Golden Rule

Documentation defines the product.

Code implements the documentation.
