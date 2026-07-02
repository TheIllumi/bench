# Bench Terminology

> Consistent language reduces cognitive load.
>
> Bench uses one term for one concept. Avoid synonyms in documentation,
> code, UI, commit messages, and discussions.

------------------------------------------------------------------------

# Vocabulary Rules

-   One concept → One name.
-   If a term is defined here, use it everywhere.
-   New terminology must be documented before it is adopted.

------------------------------------------------------------------------

# Domain

## Workspace

The user's entire Bench environment.

There is exactly one Workspace.

It owns all persistent data.

------------------------------------------------------------------------

## Entity

A persistent object with identity.

Characteristics:

-   Has an immutable ID
-   Has a lifecycle
-   Can be referenced
-   Exists independently

Entities in Bench:

-   Workspace
-   Project
-   Task
-   Note
-   CaptureItem
-   List

------------------------------------------------------------------------

## Value Object

An object that exists only as part of an Entity.

Characteristics:

-   No independent identity
-   Cannot exist on its own
-   Lives and dies with its parent

Examples:

-   Resource
-   ListItem

------------------------------------------------------------------------

# Modules

Modules are user-facing functionality.

Modules are **not** entities.

Current Modules:

-   Focus
-   Projects
-   Capture
-   Lists
-   Parking Lot

------------------------------------------------------------------------

## Focus

A module showing the user's currently focused tasks.

Focus is **derived state**.

It is not stored separately.

------------------------------------------------------------------------

## Project

The primary organizational unit.

Everything meaningful belongs to exactly one Project.

Projects provide context.

------------------------------------------------------------------------

## Task

A single actionable piece of work.

Tasks always belong to one Project.

------------------------------------------------------------------------

## Note

Long-form information attached to a Project.

Notes never exist independently.

------------------------------------------------------------------------

## Capture

A temporary holding area for unprocessed thoughts.

Capture should be frictionless.

Capture items are later converted into Projects or Tasks, or discarded.

------------------------------------------------------------------------

## Parking Lot

A place for intentionally deferred ideas.

The purpose of the Parking Lot is to prevent interruptions without
losing ideas.

------------------------------------------------------------------------

## Lists

Simple checklists.

Examples include:

-   Shopping
-   Packing
-   Books
-   Movies
-   Groceries

Lists are intentionally generic.

------------------------------------------------------------------------

# Project States

Every Project has exactly one state.

## Focused

Receiving active attention.

Maximum: 5.

## Active

Ongoing work that is not currently focused.

## Parked

Paused intentionally.

## Archived

Completed or retired.

Archived Projects cannot contain Focus Tasks.

------------------------------------------------------------------------

# Views

A View is a screen within a Module.

Examples:

-   Focus View
-   Project View
-   Capture View

------------------------------------------------------------------------

# Components

Reusable UI building blocks.

Examples:

-   Sidebar
-   Task Card
-   Button
-   Modal
-   Checkbox

Components are implementation details and are not part of the domain
model.

------------------------------------------------------------------------

# Derived State

Information calculated from existing data instead of stored.

Examples:

-   Focus = Tasks where `focused == true`
-   Focused Projects = Projects where `state == Focused`
-   Project Progress = Completed Tasks ÷ Total Tasks

------------------------------------------------------------------------

# Naming Conventions

Use these names consistently:

  Preferred   Avoid
  ----------- -----------------------------------------
  Module      Feature
  View        Page / Screen
  Entity      Object (generic)
  Project     Category
  Capture     Inbox
  Lists       Shopping (when referring to the module)

------------------------------------------------------------------------

# Golden Rule

If a term is not defined in this document, it should not become part of
Bench until it has been intentionally documented.
