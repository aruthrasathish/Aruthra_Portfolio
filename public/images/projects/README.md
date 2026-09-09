# Project cover images

Every project card leads with a visual. Until a real screenshot exists, the
card draws a project-specific SVG cover (`visualType` in `lib/data.js`), so
nothing is ever a broken image and no stock photography is used.

Drop a real screenshot here under the filename below, then set
`projects[].image` to that path in `lib/data.js` — that one edit is all it
takes to switch the card over. (The slot ships as `null` so the drawn cover is
what gets server-rendered, with no 404 round trip on every page load.)

| Filename                | Project                                        | `visualType` fallback |
| ----------------------- | ---------------------------------------------- | --------------------- |
| `watchtower.jpg`        | WatchTower — MCP Server for Incident Response   | `incident-console`    |
| `search-ranking.jpg`    | Real-Time Search Ranking System                 | `search-ranking`      |
| `usda-ai-assistant.jpg` | USDA Rural Development AI Assistant             | `rag-assistant`       |
| `speakup.jpg`           | SpeakUp — Anonymous Voice Q&A Platform          | `live-qa`             |
| `cnn-gru.jpg`           | Academic Performance Intelligence System        | `ml-dashboard`        |
| `pathly.jpg`            | Pathly — URL Shortener                          | `link-redirect`       |
| `careerlens.jpg`        | CareerLens — Job Search Intelligence Platform   | `job-funnel`          |

Guidelines:

- **Aspect ratio:** featured covers render at **16:10**, the "Also built" row
  at **16:9**, both `object-fit: cover`. Export around **1600×1000 px** and keep
  the meaningful part of the UI away from the edges.
- `.webp` or `.png` also work — change the extension in `lib/data.js`
  (`projects[].image`) to match.
- Update `projects[].imageAlt` to describe the screenshot you actually add.
  The current values describe the intended subject.
- To go back to the drawn cover, set `image` back to `null`.
- A path that points at a missing file still degrades to the drawn cover
  rather than a broken image, so a typo is not fatal.
