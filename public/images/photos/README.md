# Photos — "Beyond the code" strip (inside the About section)

Four cards, one per story. Drop the photograph here under the filename below,
then set that photo's `src` in `lib/data.js` (`gallery.photos`) to the matching
path. Until then the slot ships as `null` and `components/PhotoStrip.js`
renders a designed placeholder carrying the same caption — never a broken
image, and no 404 round trip on every page load.

| # | Filename                              | Caption                               | Sub-caption                                  |
| - | ------------------------------------- | ------------------------------------- | -------------------------------------------- |
| 1 | `american-university-research.jpg`    | American University                   | AI/ML Research                               |
| 2 | `gmu-teaching.jpg`                    | George Mason University               | Graduate Teaching Assistant                  |
| 3 | `academic-excellence.jpg`             | Academic Excellence Award             | George Mason University · 2026               |
| 4 | `engineering.jpg`                     | Building scalable intelligent systems | Software · Distributed Systems · Applied AI  |

What works in each slot:

1. **Research** — working at a workstation, presenting research, or another
   professional American University photo.
2. **Teaching** — classroom, lab, presentation, or a campus/teaching photo.
3. **Award** — award, recognition or graduation photograph. If you have more
   than one shot of the event, prefer a *different* crop from the one used in
   the Awards section so the two do not read as duplicates.
4. **Engineering** — coding, presenting, a lab or desk setup, a hackathon or a
   technical conference. Not a travel, restaurant or lifestyle photo.

Guidelines:

- Tiles render at a **4:5 portrait** ratio, `object-fit: cover`, so keep the
  subject centred; anything important near an edge may be cropped.
- Export around **900×1125 px**, quality ~80. These are lazy-loaded but still
  count toward page weight.
- `.webp` works too — just match the extension in the `src` you set.
- Update each photo's `alt` in `lib/data.js` to describe the image you actually
  add. The current values describe the intended subject.
