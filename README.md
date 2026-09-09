# Aruthra Portfolio

A personal portfolio website built with [Next.js](https://nextjs.org), showcasing
my projects, skills, and experience.

The site itself is the recruiting artifact — there is deliberately no resume
download anywhere in it.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19, React Compiler)
- **Styling:** Tailwind CSS + CSS custom properties (dark/light themes via `next-themes`)
- **Motion:** Framer Motion, plus CSS keyframes in `app/globals.css`
- **Background:** three.js / @react-three/fiber (`components/AnimatedBackground.js`)
- **Icons:** lucide-react, plus hand-rolled brand marks in `components/ui/Icons.js`
- **Contact form:** Next.js Route Handler (`app/api/contact/route.js`) delivering through Resend
- **Deployment:** AWS Amplify

## Getting Started

Requires Node.js 20.9 or newer (Next 16's floor; developed on Node 22).

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

Checks:

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill it in. Every variable is optional
for local development — the contact form detects an unconfigured mailer and
returns a clear "not wired up yet" message instead of pretending a message was
sent.

| Variable            | Required for | Notes                                                        |
| ------------------- | ------------ | ------------------------------------------------------------ |
| `RESEND_API_KEY`    | Contact form | From <https://resend.com/api-keys>. Server-side only.         |
| `CONTACT_FROM_EMAIL`| Contact form | A verified sender, e.g. `Portfolio <hello@yourdomain.com>`.  |
| `CONTACT_TO_EMAIL`  | Optional     | Defaults to the address in `lib/data.js`.                    |

The API key is read only inside the route handler and is never exposed to the
client bundle. `.env.local` is gitignored; `.env.example` holds empty values and
is committed as documentation.

## Page order

Content order is set in `app/page.js`, and the navbar, scroll spy and mobile
menu all read from the same list in `components/Navbar.js`:

1. Hero / Overview
2. About — engineering story and three identity pillars
3. Education
4. Experience
5. Skills
6. Featured Projects
7. Awards & Recognition
8. Certifications
9. Contact

## Content

`lib/data.js` is the single source of truth for every piece of content. Nothing
in the components hardcodes copy, metrics or asset paths — changing a metric,
adding a project, or reordering skills is a data edit, not a component edit.

## Images

Most image slots degrade gracefully: a missing file renders a neutral
placeholder rather than a broken image. Each directory documents its own
filenames and export sizes in its own `README.md`.

| Directory                       | If the file is missing                                       |
| ------------------------------- | ------------------------------------------------------------ |
| `public/images/projects/`       | A "Screenshot pending" plate, sized to the same aspect ratio  |
| `public/images/awards/`         | A neutral icon tile in place of the photo                     |
| `public/images/logos/`          | A monogram tile built from the organisation's initials        |
| `public/images/certifications/` | **No fallback** — badge files must be present                 |

## Avatar

The hero character is an animated WebP. Only the files the site actually loads
are tracked; the frame directories and matting intermediates that produced them
stay local and are gitignored.

| File                                | Role                                            |
| ----------------------------------- | ----------------------------------------------- |
| `aruthra-avatar-final-noblend.webp` | The animation the site loads                    |
| `aruthra-avatar-final.webp`         | Master before the frame-blending fix            |
| `aruthra-avatar-static.webp`        | Single-frame fallback for `prefers-reduced-motion` |

`scripts/build-avatar-cutout.py` rebuilds the cutout from source frames.
See `public/avatar/README.md` for the full pipeline and per-file measurements.

## Accessibility

- `prefers-reduced-motion` is honoured throughout: the background stops
  animating, the avatar swaps to a still frame, and section reveals resolve
  instantly.
- A skip link precedes the navbar.
- Proficiency bars expose `role="meter"` with real `aria-valuenow` values, and
  the skill filter is a labelled tablist.
- Both themes are authored as explicit token sets rather than inverted colours.

## Deployment

This project is deployed using [AWS Amplify](https://aws.amazon.com/amplify/).
Amplify provides continuous deployment from the GitHub repository with automatic
builds on every push to `master`. Set the environment variables above in the
Amplify console — they are not read from `.env.local` in a hosted build.

## Project Structure

```
app/
├── page.js              # Section order for the whole site
├── layout.js            # Root layout, fonts, metadata
├── globals.css          # Theme tokens, component classes, keyframes
└── api/contact/route.js # Contact form delivery
components/              # One file per section
└── ui/                  # Reveal, MetricStat, OrgLogo, Icons
hooks/                   # Pointer, media query, reduced motion, mounted,
                         #   character scheduler
lib/data.js              # All content
public/avatar/           # Hero character assets
public/images/           # Asset slots, each with its own README
scripts/                 # Avatar asset pipeline (Python)
```

## Author

**Aruthra Sathish Kumar** — sole author and contributor.

- GitHub: [@aruthrasathish](https://github.com/aruthrasathish)
- LinkedIn: [aruthrasathish](https://www.linkedin.com/in/aruthrasathish)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
