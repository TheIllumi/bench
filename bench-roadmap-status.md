# Bench — Roadmap & Status

Built from: `CONTEXT.md` (documented roadmap + architecture), the commit history in GitHub Desktop, and the Antigravity prompt sequence for the Areas UX work.

---

## 1. Where Bench is right now

Current version: **v0.2.0 "Sharpen"** (in progress). Focus, Capture, Parking Lot, Archive, Jot, Settings, multi-module search, and application icon suite are fully implemented. The active work is completing **Areas UX polish** (moving to an Inspector-based workspace model) before closing out v0.2.0.

A note on terminology: `CONTEXT.md` §18 flags that the docs call the organizational entity **"Project"**, but the code implements it as **"Area."** The external roadmap notes propose a *separate* future "Projects" phase (checklists like "Rich Notes / Areas / Projects / Calendar / Goals"). Worth deciding deliberately later whether that's a second entity nested under Areas, or whether "Projects" is just the docs' name for what Areas already is — don't let the two silently merge without an ADR, per your own DDD process.

---

## 2. High-level roadmap

| Phase | Status | Notes |
|---|---|---|
| **Phase 1–2 — Desktop shell & core UX** | ✅ Done | Tauri desktop layout + window constraints, Keyboard Shortcuts Overlay in Command Palette, Phase 2.5 UX micro-polish, Tokyo Night custom scrollbars, Multi-resolution Application Icon Suite (Tauri desktop & web targets). |
| **Phase 3 — Areas Foundation** | ✅ Done | `feat(domain): implement Phase 3 Areas Foundation and assignment` — Area entity, task↔area assignment. |
| **Phase 3.5 (domain) — Areas Task Organization & Navigation** | ✅ Done | `feat(domain): implement Phase 3.5 Areas Task Organization & Navigation` — underlying data/nav logic. |
| **Phase 3.5/3.6 (UX) — Areas UX Polish, Integration & Interaction** | 🚧 In progress | This is the Antigravity prompt sequence — see section 3 below. **You are here.** |
| **Phase 4 — Projects** *(per your external roadmap notes)* | 🔜 Planned | Needs a decision first: is this a new entity, or a renaming/extension of Areas? Progress %, due dates, notes, archived state. |
| **Phase 5 — Command Palette / Search improvements** | ✅ Partial / 🚧 In progress | Multi-module search, Focus task sync fix (`Repository.isFocusTask`), Command Palette overlay. Further structured queries (`area bench`, `created today`) planned. |
| **Phase 6 — Keyboard-first workflow** | ✅ Partial / 🚧 In progress | Global navigation (`Alt+1`–`7`), Quick Capture (`Ctrl+N`/`C`), Sidebar toggle (`Ctrl+B`), list navigation & item action bindings (`N`, `E`, `Space`, `F`, `P`, `A`, `D`, `R`). |
| **Phase 7 — Statistics** | 🔜 Planned | Lightweight daily/weekly/monthly counts (Captured, Completed, Focused, Archived). |
| **Phase 8 — SQLite + Tauri persistence** | 🔜 Planned | Repository → SQLite → Tauri commands. No UI changes required. Aligns with official **v0.3.0 "Craft"** milestone. |
| **v0.2.0 "Sharpen"** *(official)* | 🚧 In progress | Areas UX, Jot, Settings, Search, Application Icons, Command Palette fixes. |
| **v0.3.0 "Craft"** *(official)* | 🔜 Planned | SQLite, import/export, backup/restore, attachments — overlaps Phase 8 above. |
| **v1.0.0 "Built"** *(official)* | 🔜 Planned | Stability, docs review, performance, accessibility. |
| Explicitly deferred until fundamentals are solid | ⛔ Not planned yet | Calendar, notifications, AI, cloud sync, tags, kanban, recurring tasks, attachments (until v0.3.0), markdown rendering. |

---

## 3. Current work in detail — Areas UX Polish (Phase 3.5/3.6)

This is the granular, prompt-by-prompt tracker for the Antigravity sequence. Reflects the commit history as of your latest screenshot plus the redesign to remove the dedicated Area page.

### ✅ Done
| Commit | Prompt / Feature |
|---|---|
| `feat(areas): redesign area list row layout` | Prompt 1 |
| `feat(areas): add live active/completed/parked/archived statistics` | Prompt 2 |
| `feat(areas): add sorting (alphabetical, recently updated/created, most active)` | Prompt 3 |
| `feat(areas): add empty state for no Areas` | Prompt 6 |
| `fix(areas): add spacing between Folder icon and Area name in list row` | Prompt 6.1 |
| `fix(areas): move statistics below row content to prevent Area name clipping` | Prompt 6.2 |
| `style(areas): match No Areas empty state to other modules' style` | Prompt 6.5 (first pass) |
| `fix(areas): left-align No Areas empty state to match other modules` | Prompt 6.5b (alignment fix) |
| `style(areas): add line space before create Area action hint in empty state` | Manual extra polish |
| `fix(assets): apply application icons across web and tauri targets` | Brand & Asset Application |
| `docs: audit and sync README, ROADMAP, and release notes` | Documentation Alignment |
| `fix(palette): sync Command Palette Focus tasks with Repository.isFocusTask` | Command Palette Fix |
| `feat(settings): wipe Jot content on Clear Database trigger` | Settings & Jot Integration |

### 🔁 Being superseded (built, but about to be removed/replaced by the no-page redesign)
| Commit | What happens to it |
|---|---|
| `feat(areas): add dedicated Area view page` | Removed by **Prompt 6.6** — the Inspector becomes the Area workspace instead of a separate page. |
| `feat(areas): add empty state for Area with no tasks` | Not lost — this exact empty state gets rebuilt *inside the Inspector* by **Prompt 6.7**. |

This isn't wasted work — the visual design (empty state copy, icon, styling) carries over, it just moves from "on a page" to "inside the Inspector."

### 🚧 Up next (not yet run) — do these before Prompt 7
1. **Prompt 6.6** — Remove the dedicated Area page; undo the double-click-to-open-page behavior; disconnect the page-tied "N" shortcut.
2. **Prompt 6.7** — Move the Tasks list (and its empty state) into the Area Inspector.
3. **Prompt 6.8** — Wire "N" to create a task from inside the Area Inspector.

### 🔜 Then, in order
4. **Prompt 7** — Finish Area Inspector metadata layout (Name, Description auto-grow, Statistics, Created/Updated).
5. **Prompt 8** — Optional Lucide icons per Area.
6. **Prompt 9** — Command Palette integration for Areas.
7. **Prompt 10** — Archive validation (block archiving Areas with active tasks).
8. **Prompt 11** — Keyboard navigation for the Areas list (arrows, enter, escape, delete).
9. **Prompt 11.5** — Switching between Area Inspector ↔ Task Inspector, with a reliable way back.
10. **Prompt 12** — Visual polish pass (end of Phase 3.5).
11. **Prompts 14–19** — Phase 3.6 polish: Inspector spacing, statistics hierarchy, two-column metadata, aligned stats, placeholder copy, Tasks header integration.
12. **Prompts 20–22** — Verification/refinement passes on Inspector reachability, current-Area vs selected-Task state, and keyboard escape flow (these are second passes on things Prompts 6.7–11.5 already build, not new features).
13. **Prompt 23** — Final visual polish pass.
14. **Prompt 24** — Manual verification checklist (no code, just a test pass for you).

Once Prompt 24 is done, Phase 3.5/3.6 (Areas UX) is complete and Bench moves to **Phase 4 (Projects)** or whichever phase you decide to tackle next.

---

## 4. Suggested near-term order of operations

1. Finish the Areas UX prompt sequence above (Prompts 6.6 → 24).
2. Decide the Projects-vs-Areas question before starting Phase 4, so you're not building on an undocumented divergence.
3. Then work Phases 4–8 roughly in the order listed in section 2 — each one lines up with either your own external roadmap notes or Bench's official `v0.2.0`/`v0.3.0` milestones, so you're not duplicating effort across the two.
