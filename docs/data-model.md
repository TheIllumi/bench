# Data Model

> **The UI is temporary. The data model is forever.**

------------------------------------------------------------------------

# Purpose

This document defines every persistent concept that exists within Bench.

It is independent of:

-   UI
-   Framework
-   Storage engine
-   Database

If a concept is not defined here, it does not exist.

------------------------------------------------------------------------

# Engineering Philosophy

The data model represents **reality**, not implementation.

The UI reflects the data model.

The data model never bends to accommodate the UI.

------------------------------------------------------------------------

# Model Layers

Bench consists of four conceptual layers.

## 1. Entities

Persistent domain objects.

Examples:

-   Workspace
-   Project
-   Task
-   Note
-   CaptureItem
-   List

------------------------------------------------------------------------

## 2. Modules

User-facing functionality.

Examples:

-   Focus
-   Projects
-   Capture
-   Lists
-   Parking Lot

Modules are not stored.

Modules present data.

------------------------------------------------------------------------

## 3. Views

Individual screens inside modules.

Examples:

-   Focus View
-   Project View
-   Capture View

------------------------------------------------------------------------

## 4. Components

Reusable UI elements.

Examples:

-   Sidebar
-   Button
-   Task Card
-   Modal

Components are implementation details.

------------------------------------------------------------------------

# Design Rules

## One Owner

Every Entity belongs to exactly one owner.

Shared ownership is not allowed.

------------------------------------------------------------------------

## Stable Identity

Every Entity has an immutable ID.

IDs never change.

------------------------------------------------------------------------

## Derived State

If something can be calculated,

it should never be stored.

------------------------------------------------------------------------

## Single Responsibility

Every Entity represents one concept.

No Entity should have multiple responsibilities.

------------------------------------------------------------------------

# Entity: Workspace

Purpose:

Represents the user's entire Bench.

Relationships:

Contains:

-   Projects
-   Capture
-   Lists
-   Settings

Constraints:

-   Exactly one Workspace exists.
-   Cannot be deleted.

Fields:

-   id
-   createdAt
-   updatedAt

------------------------------------------------------------------------

# Entity: Project

Purpose:

Represents a long-term initiative.

Fields:

-   id
-   title
-   description
-   state
-   createdAt
-   updatedAt
-   order

Relationships:

Contains:

-   Tasks
-   Notes
-   Resources

States:

-   Focused
-   Active
-   Parked
-   Archived

Constraints:

-   Exactly one state.
-   Maximum 5 Focused Projects.
-   Archived Projects cannot contain Focus Tasks.

------------------------------------------------------------------------

# Entity: Task

Purpose:

Represents one actionable piece of work.

Fields:

-   id
-   projectId
-   title
-   completed
-   focused
-   createdAt
-   updatedAt
-   order

Relationships:

Belongs to exactly one Project.

Constraints:

-   Project required.
-   Cannot belong to multiple Projects.
-   Completed Tasks cannot be focused.
-   Tasks inside Archived Projects cannot be focused.
-   Maximum 3 Focus Tasks globally.

------------------------------------------------------------------------

# Entity: Note

Purpose:

Stores project knowledge.

Fields:

-   id
-   projectId
-   title
-   content
-   createdAt
-   updatedAt

Relationships:

Belongs to exactly one Project.

Constraints:

Cannot exist without a Project.

------------------------------------------------------------------------

# Entity: CaptureItem

Purpose:

Temporary holding area for unprocessed thoughts.

Fields:

-   id
-   text
-   createdAt

Lifecycle:

Capture

↓

Review

↓

Convert to:

-   Task
-   Project

or Delete.

Constraints:

CaptureItems never belong to Projects.

------------------------------------------------------------------------

# Entity: List

Purpose:

Reusable checklist.

Examples:

-   Shopping
-   Packing
-   Reading
-   Movies

Fields:

-   id
-   title
-   createdAt
-   updatedAt
-   order

Relationships:

Contains ListItems.

------------------------------------------------------------------------

# Value Objects

## Resource

Represents reference material.

Fields:

-   title
-   url
-   icon

Resources exist only inside Projects.

------------------------------------------------------------------------

## ListItem

Represents one checklist item.

Fields:

-   text
-   completed
-   order

ListItems exist only inside Lists.

------------------------------------------------------------------------

# Derived State

Focus

↓

Tasks where focused == true

------------------------------------------------------------------------

Focused Projects

↓

Projects where state == Focused

------------------------------------------------------------------------

Project Progress

↓

Completed Tasks ÷ Total Tasks

Derived state should never be persisted.

------------------------------------------------------------------------

# Global Invariants

-   Exactly one Workspace exists.
-   Every Task belongs to exactly one Project.
-   Every Note belongs to exactly one Project.
-   Maximum 3 Focus Tasks.
-   Maximum 5 Focused Projects.
-   IDs are immutable.
-   Archived Projects cannot contain Focus Tasks.
-   Derived state is never stored.

------------------------------------------------------------------------

# Future Compatibility

This model must remain valid if persistence changes from:

JSON

↓

SQLite

↓

Cloud Sync

without changing the domain model.

Storage technology may evolve.

The model should not.

------------------------------------------------------------------------

# Example Hierarchy

Workspace ├── Projects │ ├── Tasks │ ├── Notes │ └── Resources ├──
Capture ├── Lists └── Settings

This hierarchy defines ownership, not the UI.
