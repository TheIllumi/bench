# Architecture

> The architecture exists to protect the domain model.

------------------------------------------------------------------------

# Purpose

This document describes how Bench is structured internally.

It intentionally focuses on architectural boundaries rather than
implementation details.

The architecture should remain stable even if the UI framework, storage
engine, or programming language changes.

------------------------------------------------------------------------

# Guiding Principles

-   Documentation drives implementation.
-   The Domain is the heart of the application.
-   The UI reflects state; it does not own state.
-   Simplicity is preferred over abstraction.
-   Local-first by default.

------------------------------------------------------------------------

# Layered Architecture

Documentation ↓ Domain ↓ Application ↓ Persistence ↓ Presentation (UI)

Each layer has one responsibility.

Higher layers may depend on lower layers through well-defined
interfaces.

Lower layers must never depend on higher layers.

------------------------------------------------------------------------

# Layers

## Domain

Responsible for business concepts.

Examples:

-   Project
-   Task
-   Note
-   List
-   CaptureItem

The Domain knows nothing about:

-   HTML
-   CSS
-   JavaScript frameworks
-   Tauri
-   JSON
-   SQLite

------------------------------------------------------------------------

## Application

Coordinates workflows.

Examples:

-   Create Project
-   Complete Task
-   Move Task to Focus
-   Archive Project
-   Convert CaptureItem into Task

Business rules live here.

------------------------------------------------------------------------

## Persistence

Responsible only for storing and loading data.

v0.1 - JSON

Future - SQLite - Optional Sync

Changing storage must not require changing the Domain.

------------------------------------------------------------------------

## Presentation

Built with:

-   Tauri
-   HTML
-   CSS
-   JavaScript

Responsibilities:

-   Render data
-   Capture user input
-   Display feedback

No business rules belong here.

------------------------------------------------------------------------

# Event Flow

User Action ↓ Application Logic ↓ Domain Validation ↓ Persistence ↓ UI
Refresh

------------------------------------------------------------------------

# Folder Structure

src/ - components/ - modules/ - domain/ - services/ - storage/ -
utils/ - assets/

Each folder has a single responsibility.

------------------------------------------------------------------------

# State Management

Bench uses a single source of truth.

The UI derives its state from the Domain.

Avoid duplicated state.

Avoid hidden state.

------------------------------------------------------------------------

# Error Handling

Development: - Fail loudly.

Production: - Fail gracefully. - Preserve user data whenever possible.

------------------------------------------------------------------------

# Performance Goals

-   Cold start under one second (target).
-   Minimal memory usage.
-   No unnecessary background processes.
-   Instant navigation between modules.

------------------------------------------------------------------------

# Design Constraints

-   Offline first
-   Keyboard first
-   Minimal dependencies
-   No unnecessary abstraction
-   Maintainable by a single developer

------------------------------------------------------------------------

# Future Evolution

The architecture should support evolution from:

JSON ↓ SQLite ↓ Optional Cloud Sync

without changing the Domain layer.

------------------------------------------------------------------------

# Golden Rules

1.  The Domain must never know about the UI.
2.  The UI must never bypass Application logic.
3.  Persistence stores state; it does not define it.
4.  Documentation is the architectural source of truth.
