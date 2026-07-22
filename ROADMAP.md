# Roadmap

> Bench is built incrementally.
>
> Every milestone should make the product noticeably more useful while remaining true to its core philosophy:
>
> **Reduce cognitive load.**
>
> New features are added only when they make Bench simpler to use—not more complex.

---

# Product Vision

Bench aims to become the desktop command center that remains open throughout the day.

Its purpose is not to organize everything.

Its purpose is to help users decide what deserves their attention **right now**.

Every milestone should move Bench closer to that goal.

---

# Guiding Principles

Every milestone should:

- Reduce cognitive load.
- Improve clarity.
- Preserve simplicity.
- Respect the Documentation-First workflow.
- Avoid feature creep.

If a feature violates these principles, it should not be added.

---

# Milestone 1 — Workbench (v0.1.0) ✅ Shipped

## Goal

Build the foundation.

Bench should already be useful before any advanced functionality is introduced.

### Delivered

- [x] Tauri desktop application
- [x] Sidebar navigation
- [x] Areas (documented as Projects; implemented as Areas — see ADR 0003)
- [x] Tasks
- [x] Focus
- [x] Capture
- [x] Parking Lot
- [x] Local JSON persistence
- [x] Keyboard shortcuts
- [x] Dark mode

### Success Criteria — met

A user can:

- Create Areas
- Capture ideas
- Organize work
- Select focus tasks
- Work entirely offline

Bench already replaces the user's Notepad workflow.

---

# Milestone 2 — Sharpen (v0.2.0) 🚧 In Progress

## Goal

Improve speed and usability.

### Delivered so far

- [x] Areas Foundation and task assignment
- [x] Areas task organization & navigation
- [x] Areas list redesign (icons, descriptions, live statistics, sorting)
- [x] Areas empty states (no tasks / no Areas)
- [x] Jot module (replaces the earlier "Notes" concept)
- [x] Settings overhaul
- [x] Search across modules
- [x] Command Palette cleanup and Keyboard Shortcuts overlay
- [x] Focus workflow improvements
- [x] Desktop layout and window-constraint polish
- [x] Multi-resolution application icon suite configured across Tauri desktop targets and web favicons
- [x] Global custom scrollbars (Tokyo Night style)
- [x] Numerous bug fixes and performance improvements

### In progress right now

Areas UX polish — moving from a dedicated Area page to an **Inspector-as-workspace**
model, so opening an Area, browsing its tasks, and switching between Area/Task
details all happen in one place. Remaining work:

- [ ] Area Inspector shows the Area's task list directly (no separate page)
- [ ] Create-task shortcut (`N`) wired up from inside the Area Inspector
- [ ] Area Inspector metadata layout finalized (name, description, stats, timestamps)
- [ ] Optional Lucide icons per Area
- [ ] Area results in the Command Palette
- [ ] Archive validation (block archiving Areas with active tasks)
- [ ] Keyboard navigation for the Areas list and Area Inspector
- [ ] Switching cleanly between Area Inspector and Task Inspector
- [ ] Final visual polish pass across the Areas module

### Success Criteria

Bench feels significantly faster and smoother without increasing complexity.
Met for search, Command Palette, and Settings; Areas polish is the remaining
piece before this milestone is fully closed out.

---

# Milestone 3 — Craft (v0.3.0)

## Goal

Strengthen the foundation.

### Planned Features

- SQLite persistence
- Import / Export
- Backup and restore
- Attachments
- Improved data reliability

### Success Criteria

Bench becomes resilient enough for long-term daily use.

---

# Milestone 4 — Built (v1.0.0)

## Goal

Ship the first stable release.

### Planned Features

- Stability improvements
- Bug fixes
- Documentation review
- Performance optimization
- Accessibility improvements

### Success Criteria

Bench is polished, reliable, and ready to recommend to others.

---

# Under Consideration

An open question worth deciding deliberately (with an ADR) before it's
built rather than falling out of implementation by accident:

- **Projects, as a concept distinct from Areas.** Early docs used "Project"
  as the name for what's now implemented as "Area." A future idea is a
  *separate* Projects layer nested under Areas — with progress tracking,
  completion percentage, due dates, and its own notes — rather than Areas
  and Projects being the same thing under two names. This needs a decision,
  not a default.

---

# Beyond 1.0

Ideas for future exploration include:

- Optional cloud synchronization
- Multiple workspaces
- Plugin system
- Mobile companion
- Calendar integration

These ideas are intentionally **not planned**.

They must pass the Bench Test before becoming roadmap items.

---

# What Will Never Be a Goal

Bench does not aim to become:

- Notion
- ClickUp
- Jira
- Trello
- A CRM
- A team collaboration platform
- A knowledge management system
- A habit tracker
- A time tracker

Bench succeeds by remaining focused.

---

# Measuring Success

Bench is successful when:

- Users keep it open throughout the day.
- The next action is obvious.
- The interface remains calm.
- Organizing work never feels like work.
- The product remains understandable to a new contributor.

---

# Living Document

This roadmap represents current intentions, not promises.

Milestones may evolve as Bench grows.

However, the product philosophy should remain stable.

When in doubt:

**Reduce cognitive load.**
