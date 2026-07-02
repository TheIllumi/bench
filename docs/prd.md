# Product Requirements Document (PRD)

# Bench v0.1 --- Workbench

Status: Draft (Frozen)

------------------------------------------------------------------------

# Vision

Bench is a lightweight, local-first desktop command center designed to
reduce cognitive load.

Bench does not try to organize everything.

Bench helps users decide what deserves their attention **right now**.

------------------------------------------------------------------------

# Problem

People maintain increasingly complex productivity systems.

The system becomes the work.

Bench exists to reverse that.

------------------------------------------------------------------------

# Goals

-   Reduce decision fatigue
-   Reduce context switching
-   Organize around Projects
-   Encourage intentional focus
-   Stay lightweight
-   Launch quickly
-   Remain open all day

------------------------------------------------------------------------

# Non-Goals

Bench is **not**:

-   Team software
-   CRM
-   Calendar
-   Knowledge base
-   AI assistant
-   Time tracker
-   Habit tracker
-   Project management suite

------------------------------------------------------------------------

# Target User

Individuals juggling multiple long-term responsibilities.

Examples:

-   Developers
-   Students
-   Freelancers
-   Founders
-   Creators

------------------------------------------------------------------------

# Core Modules

## Focus

Displays the three tasks currently deserving attention.

Rules:

-   Maximum 3 Focus Tasks
-   Manual selection only
-   No automatic prioritization

------------------------------------------------------------------------

## Projects

The primary organizational module.

Each Project contains:

-   Tasks
-   Notes
-   Resources

Project States:

-   Focused
-   Active
-   Parked
-   Archived

Maximum Focused Projects: 5

------------------------------------------------------------------------

## Capture

Fast, frictionless capture.

Items are later converted into:

-   Project
-   Task

or discarded.

------------------------------------------------------------------------

## Lists

Simple reusable checklists.

Examples:

-   Shopping
-   Packing
-   Reading

------------------------------------------------------------------------

## Parking Lot

Stores intentionally deferred ideas.

Purpose:

Protect focus without losing thoughts.

------------------------------------------------------------------------

# User Flow

Capture

↓

Organize into Project

↓

Create Task

↓

Promote to Focus

↓

Complete

↓

Archive

------------------------------------------------------------------------

# Interaction Principles

-   Keyboard-first
-   Minimal clicks
-   Calm interface
-   Fast transitions
-   Glanceable information

------------------------------------------------------------------------

# MVP Scope

Included:

-   Sidebar navigation
-   Projects
-   Tasks
-   Notes
-   Capture
-   Lists
-   Parking Lot
-   Local JSON persistence
-   Dark mode
-   Keyboard shortcuts

------------------------------------------------------------------------

# Explicitly Excluded

-   Search
-   Cloud Sync
-   Accounts
-   AI
-   Calendar
-   Notifications
-   Plugins
-   Themes
-   Time tracking
-   Collaboration

------------------------------------------------------------------------

# Technical Stack

Desktop: Tauri

Frontend:

-   HTML
-   CSS
-   JavaScript

Persistence:

-   JSON (v0.1)
-   SQLite (future)

------------------------------------------------------------------------

# Acceptance Criteria

Bench v0.1 is complete when a user can:

-   Create Projects
-   Create Tasks
-   Attach Notes
-   Capture ideas
-   Manage Lists
-   Promote Tasks to Focus
-   Reorder Focus Tasks
-   Persist all data locally
-   Use the application entirely offline

No additional modules should be added before these criteria are met.

------------------------------------------------------------------------

# Future Roadmap

## v0.2 --- Sharpen

-   Search
-   Archive improvements
-   Themes

## v0.3 --- Craft

-   SQLite
-   Attachments
-   Import / Export

## v1.0 --- Built

A polished, stable, developer-quality desktop companion.
