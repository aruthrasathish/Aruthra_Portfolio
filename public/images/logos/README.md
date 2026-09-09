# Organisation logos

**These are the files to provide.** No logo files are committed here: official
marks belong to their owners, so they are not bundled with this repo and are
never redrawn, approximated or recoloured. Download each one from the
organisation's own brand/press page and save it under the exact filename below.
`components/ui/OrgLogo.js` picks it up automatically on the next load — no code
change needed. Until a file exists it renders a neutral monogram tile instead
of a broken image, so the site stays correct either way.

| Filename                      | Used by                                              | Fallback shown | Where to get it                       |
| ----------------------------- | ---------------------------------------------------- | -------------- | ------------------------------------- |
| `american-university.svg`     | Experience — AI / ML Research Intern                 | `AU`           | american.edu brand/identity resources |
| `george-mason-university.svg` | Experience — Graduate TA, Education — M.S.           | `GMU`          | gmu.edu brand/identity resources      |
| `verzeo.svg`                  | Experience — Software Engineer Intern                | `VZ`           | Verzeo official site / press kit      |
| `anna-university.svg`         | Education — B.Tech                                   | `AU`           | annauniv.edu official site            |

Guidelines:

- Prefer **SVG**. If only a raster file exists, use a PNG at 2× the rendered
  size (the tile renders at 52px, so 128px+ square).
- Use the mark **as published**. Do not recolour, distort, crop or redraw a
  trademark. The tile supplies its own background and padding.
- Transparent background works best. The logo box letterboxes the mark with
  `object-fit: contain`, so the original aspect ratio is always preserved and
  logos of different shapes still line up on one grid.
- In dark mode the tile paints a near-white plate behind a real logo so
  dark-on-transparent marks stay readable — the mark itself is untouched.

Paths are configured in `lib/data.js` (`experiences[].logo`, `education[].logo`).
