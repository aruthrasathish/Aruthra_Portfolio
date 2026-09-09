# Award photographs

The Awards & Recognition card leads with a photograph on the left. The issuer,
year and program all live on the right-hand side of the card, so the image
carries the visual storytelling only — it does not need to contain any text.

| Filename                          | Award                                              |
| --------------------------------- | -------------------------------------------------- |
| `academic-excellence-award.jpg`   | Academic Excellence Award — George Mason University |

To use it: drop the file here, then set `awards[].image` in `lib/data.js` to
`"/images/awards/academic-excellence-award.jpg"` and update `awards[].imageAlt`
to describe the actual photograph.

Until then the panel renders a neutral photo placeholder at the same aspect
ratio, so the layout does not shift when the file lands. No award certificate
is ever fabricated.

Guidelines:

- The panel renders at **4:3**, `object-fit: cover`. Around **1200×900 px** is
  plenty.
- A photo of the award ceremony, the certificate, or an official credential
  image all work. Do not use a mock-up.
