# Bench v0.2.0 — Areas & Jot

Bench's second release focuses on turning Areas into a first-class part of
the app and introducing Jot, alongside a broad pass on search, the Command
Palette, and Settings.

## New

- **Jot** — a new module for quick, lightweight notes, replacing the earlier
  "Notes" concept.
- **Search across modules** — find tasks, Areas, and Jot entries from one
  place instead of hunting module by module.

## Improved

- **Areas** — redesigned list (icons, descriptions, live statistics,
  sorting), better empty states, and ongoing work toward a unified
  Inspector-based workspace for browsing and managing an Area's tasks.
- **Area assignment** — smoother flow for assigning tasks to Areas.
- **Settings** — overhauled from a placeholder into a real, usable section.
- **Command Palette** — cleaned up, plus a new Keyboard Shortcuts overlay so
  the full shortcut list is always discoverable.
- **Focus workflow** — refinements to how tasks move into and through Focus.
- **UI & Brand Polish** — desktop layout and window-constraint fixes, complete application icon suite across desktop (window/taskbar/installers) and web targets, global custom scrollbars (Tokyo Night style), and visual consistency work.
- **Keyboard shortcuts** — corrected navigation shortcuts (`Alt+1`–`7`), sidebar toggle (`Ctrl+B`), quick capture (`Ctrl+N`/`C`), and item actions across modules.

## Fixed

- Numerous bug fixes and performance improvements, including a fix for an
  intermittent page-title synchronization issue.

## Known limitations

Bench remains in **early alpha**. The Areas Inspector work is still in
progress — some interactions (task list inside the Inspector, archive
validation, full keyboard navigation) are landing incrementally in patch
releases on top of v0.2.0. See [`ROADMAP.md`](./ROADMAP.md) for the current
in-progress list.
