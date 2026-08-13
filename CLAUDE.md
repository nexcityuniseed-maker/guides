# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repo is

`nexcityuniseed-maker/guides` — a collection of **static, self-contained web pages built for mor.Group / eye mor internal use**. Everything is plain HTML/CSS/vanilla JS served directly from the repo. All UI copy and code comments are in **Japanese**.

There is **no build step, no package manager, no test suite, no linter**. What is in the repo is what ships.

```
index.html                          Claude Design 使い方ガイド (staff-facing guide page, ~3,950 lines, standalone)
aptitude/                           eye mor 適性検査 (aptitude test) app
  index.html                        Candidate-facing test form
  admin.html                        Password-gated results dashboard
  questions.js                      Question bank + scoring + type diagnosis (shared by both pages)
  storage.js                        Storage/Auth abstraction (Supabase ↔ localStorage)
  config.js                         Supabase URL + anon key
.github/workflows/
  keep-supabase-alive.yml           Daily cron ping so the free-tier Supabase project isn't auto-paused
README.md                           Effectively empty ("# guides")
```

The two areas are **independent** — `index.html` and `aptitude/` share no code, only a visual style. Changing one never requires touching the other.

## Running / testing

Open the files in a browser. Because `aptitude/*.html` load sibling scripts with relative `<script src>` tags, serving over HTTP is the reliable way:

```bash
python3 -m http.server 8000     # then http://localhost:8000/ or /aptitude/
```

Verification is manual — click through the flow. There is nothing to run in CI beyond the keep-alive workflow.

## Git workflow

- Feature work happens on a `claude/*` branch, then lands on `main` via a **merge commit** titled `Merge <something> to production` (see `git log --graph`). `main` is production.
- Commit subjects are short, imperative English one-liners (`Add resilience questions and MBTI dropdown`, `Hide score profile from candidate completion screen`) even though the code itself is commented in Japanese.
- Always `git push -u origin <branch>`. Do not push to `main` without being asked.

## `index.html` — Claude Design 使い方ガイド

A single-file marketing-style guide teaching mor.Group staff how to use Claude Design (`claude.ai/design`). Editorial magazine aesthetic: serif display faces, noise texture overlay, custom cursor ring, scroll-progress nav.

Structure conventions to preserve when editing:

- **Nine numbered sections**, each `<section class="section …" id="…">` with a matching `<li>` in `.nav-links`. The nav numbers (`01`–`09`) and section eyebrows (`— 04 / TOP PAGE`) are hand-maintained — if you add or reorder a section, update both, plus the anchor link.
- **CSS lives next to what it styles.** There is a global `<style>` in `<head>` (design tokens, base type, shared `.section`/`.fade-up` rules) and several section-local `<style>` blocks placed immediately after the section they belong to. Follow that pattern rather than appending everything to the head block.
- **UI mockups are recreated in HTML/CSS**, not screenshots (`.top-mock`, `.start-mock`, `.split-mock`, lettered `.badge-num` callouts keyed to prose below). When Claude Design's real UI changes, edit the mock markup.
- **Animation contract:** any element given class `fade-up` is picked up by the single `IntersectionObserver` at the bottom of the file and gets `.visible` on scroll. Add the class; don't write new observers.
- One `<script>` block at the very bottom handles cursor, fade-up observer, scroll progress, section highlighting, and the hamburger menu.

## `aptitude/` — eye mor 適性検査

Flow: candidate fills `index.html` → submission saved through `Storage` → recruiter reviews it in `admin.html`.

### Data model

One record per submission, shape unchanged since the localStorage era:

```js
{ id, name, submittedAt, totalTimeMs, answers, questionTimes, scores, recommendation }
// answers[questionId] = { value, timeMs }
```

In Supabase this lives in the `responses` table as `id`, `name`, `submitted_at`, `total_time_ms`, and the whole object again in a `data` jsonb column. `Storage.list()` spreads `row.data` and overwrites `id`/`submittedAt` from the real columns — so the jsonb is the source of truth for everything else.

### `storage.js`

`Storage.init()` picks the backend at runtime: Supabase if `window.SUPABASE_CONFIG.url` **and** `anonKey` are both set and the SDK loaded, otherwise localStorage under key `aptitude_responses`. Every call site must keep working in both modes — `save`/`list`/`delete` are async in both, and `clearLocal()` is a no-op in cloud mode.

There is also an `Auth` helper wrapping Supabase Auth, but **it is currently unused**: the project reverted to a simple password gate (`Revert to simple gate auth`). Don't wire it back in without being asked.

### `questions.js` — the important file

Holds `QUESTIONS` (29 entries), `scoreResponse()`, `diagnoseType()`, `FIT_COLORS`, `TRAIT_LABELS`, `RADAR_AXES`, and the `getRecommendation()` compatibility alias.

Question types: `forced-choice` (the only scored type), `text` (name), `episode` (free text, currently unused), `dropdown` (MBTI, informational only — no score impact).

Eight traits: `initiative`, `cooperation`, `optimism`, `communication`, `flexibility`, `resilience`, `detail`, `lie`. `lie` is a lie-scale/social-desirability warning, not a virtue.

Gotchas:

- **Question IDs are intentionally non-contiguous** (`q1, q2, q5, q6, q7, q8, q10, …`). Questions have been removed over time; historical records reference the old IDs. Never renumber — append new IDs instead.
- **Scoring is relative.** `scoreResponse()` sums the traits of chosen options and divides by the maximum that trait could have earned across all questions, normalized 0–100. Adding or removing any question shifts the denominator, so new results are not directly comparable to old ones. Old records are unaffected in the dashboard because their `scores` snapshot is stored with the submission.
- **`diagnoseType()` is an ordered if-chain, and the order is the logic.** `霧` (lie ≥ 67) and `雨` are checked first as disqualifiers, then the good types, with `風` as the fallback. Inserting a branch in the middle silently reclassifies candidates.
- A new trait must be added to the `traits` array in `scoreResponse()`, to `TRAIT_LABELS`, and — if it should be plotted — to `RADAR_AXES` and the `axes` list in `admin.html`'s `radarChart()`.

### `aptitude/index.html` (candidate form)

Screen-at-a-time flow driven by a `flow` array (`welcome` → each question → `done`), re-rendered into `#screens` with a fade transition. Per-question elapsed time is recorded and used by the scoring (fast answers read as intuitive/optimistic).

**The candidate never sees their scores or type** — this was a deliberate change (`Hide score profile from candidate completion screen`). The done screen shows only a thank-you. Don't "helpfully" restore the score display.

### `aptitude/admin.html` (dashboard)

List of candidates with type badge and mini score bars; clicking opens a modal with an SVG radar chart (hand-rolled, no chart library), score breakdown, warning boxes for high `lie` / low `optimism`, meta timings, and every answer with ⚡即答 / 🤔長考 speed tags.

- Auth is a **client-side password gate**: `ADMIN_PASSWORD` constant near the bottom of the file, with `sessionStorage` key `aptitude_admin_authed`. This is deliberate — it is obfuscation for an internal tool, not security. To change the password, edit the constant.
- Supabase access uses the **anon role only**; actual protection depends on RLS policies configured in the Supabase dashboard, not in this repo.
- `seedDemo()` / `generatePattern()` generate synthetic candidates covering the main types — useful for eyeballing UI changes. `clearAll()` refuses to run in cloud mode on purpose.
- Any user-supplied string rendered into a template literal goes through `escape()`. Keep doing that for new fields.

### `.github/workflows/keep-supabase-alive.yml`

Daily `curl` at 03:00 UTC (12:00 JST) against the `responses` REST endpoint so the free-tier project isn't paused after a week of inactivity. It treats `200`, `401`, and `403` as success (the DB was reached either way). It embeds the anon key inline — if the key is rotated, update **both** this workflow and `aptitude/config.js`.

## Conventions

- **Japanese for anything a person reads in-app** — UI copy, and code comments explaining intent. Identifiers stay English.
- **No dependencies beyond CDN `<script>`/`<link>` tags**: Google Fonts, and `@supabase/supabase-js@2` from jsDelivr. Do not introduce npm, a bundler, or a framework.
- **Shared palette** across all pages via CSS custom properties: `--bg:#f5f1ea`, `--ink:#1a1a1a`, `--paper:#fff`, `--accent:#ff5b3a`, `--gold:#b8923f`. Fonts: Noto Sans JP for body, Cormorant Garamond / DM Serif Display / Shippori Mincho for display.
- **Rendering is template literals + `innerHTML`.** There is no virtual DOM and no reactivity; a state change means calling the relevant `render*()` function again.
- **Credentials in this repo are committed on purpose** (Supabase anon key, admin password) because these are client-side pages. That's an accepted trade-off here — mention it if asked, but don't refactor it away unprompted, and don't add any *secret* key to the repo.
