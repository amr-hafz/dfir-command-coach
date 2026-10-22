# DFIR Command Coach

A bilingual (Arabic / English) guided lab coach for **CCY3003 — Digital Forensics & Incident Response**, Section 04: *Acquiring Evidence Locally and Remotely*.

### Live site

**https://amr-hafz.github.io/dfir-command-coach/**

Open `index.html` in a browser. **No server, no package installation, no internet connection is required** — everything is plain HTML, CSS and vanilla JavaScript with no external fonts, CDNs or third-party libraries.

> Students do not need to install anything — just open the link, press the **ع / EN** button to switch to Arabic, and work through the phases.

---

## What it covers

The site is now built around the actual teaching spine of the section, not a single demo path:

| Phase | Steps | Focus |
| --- | --- | --- |
| 1 — Prepare | 4 | Power state, elevated shell, case folder, synthetic lab activity |
| 2 — Volatile evidence | 4 | Processes, network connections, live memory snapshot, RAM image |
| 3 — Persistent artifacts | 4 | Event logs, system information, volume information, targeted files |
| 4 — Preserve & verify | 3 | Hashing, collection log, bundle verification |
| 5 — Remote collection | 5 | Remoting setup, trusted hosts, first remote collection, remote triage, local vs. remote |
| 6 — Deliver & reflect | 1 | Evidence bundle and submission |

21 steps in total, plus a 6-tier order-of-volatility ladder (CPU registers → cache and RAM → network state → processes and system state → registry and event logs → disk and long-term storage), a local-vs-remote comparison table, an 8-tool map, and a 5-question self-check.

## Features

- **Bilingual EN / AR** with full RTL layout (`dir="rtl"`, logical CSS properties throughout).
- **Dark / light theme** toggle — dark is the default (lab room), light for bright projectors.
- **Progress tracking** — tick a step off and it is stored in `localStorage` along with your notes, analyst name, host and target.
- **Search** across step titles, commands and artifacts (`/` focuses the search box).
- **Collection log** — one row per completed step, exported to `collection-log.csv` with the exact seven columns required by the lab guide:
  `timestamp, analyst, host, command, output, hash, limitation`.
- **Print worksheet** (`P`) — a print stylesheet strips the chrome and produces a clean paper version of the whole lab.
- **Keyboard shortcuts** — `/` search, `P` print, `Esc` clear.

## File layout

```
index.html    page shell — structure only, no content
styles.css    design system: tokens, layout, components, print stylesheet
data.js       the content model (window.LAB) — all bilingual copy lives here
app.js        rendering, i18n, progress, search, CSV export, shortcuts
```

### Editing content

**All copy lives in `data.js`** as `{ en: "...", ar: "..." }` pairs. You never need to touch markup to change wording — edit the string in `data.js`, save, refresh the page.

The `window.LAB` object holds:

| Key | Contents |
| --- | --- |
| `meta` | course code, title, duration, level, shell, outcome |
| `objectives` | learning objectives shown in the hero |
| `plan` | the 90-minute session breakdown (`m` = minutes, `t` = title) |
| `volatility` | the 6-tier order-of-volatility ladder (`label`, `note`, `desc`, `steps`) |
| `phases` | the 6 phase headers (`id`, `n`, `label`, `clock`, `desc`) |
| `steps` | a flat array of the 21 steps, each tagged with its `phase` |
| `tools` | the 8-tool map (PowerShell, WinPmem, KAPE, FTK Imager, RamCapturer, CyLR, Velociraptor, EDR) |
| `comparison` | local vs. remote comparison rows (`k`, `local`, `remote`) |
| `deliverables` | the 5 submission deliverables |
| `quiz` | the 5 self-check questions (`q`, `a`) |

Each step supports `title`, `intent`, `purpose`, `output`, `gotchas`, `teacher`, `artifacts`, `volatility` (tier), `kind` (concept / command / remote), `required` and `phase`.

## Local preview

Double-clicking `index.html` works, but a tiny local server is nicer (it keeps `localStorage` scoped to one origin):

```bash
python -m http.server 8733 --bind 127.0.0.1
# then open http://127.0.0.1:8733/index.html
```

## Safety

Use a lab VM or a dedicated test machine. The remote steps assume a second Windows VM prepared by the instructor (`DFIR-WIN02`). Never run these commands on production devices. The commands are educational collection examples, not a replacement for a validated forensic acquisition workflow.
