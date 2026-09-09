# Aruthra Portfolio

A personal portfolio website built with [Next.js](https://nextjs.org), showcasing my projects, skills, and experience.

The site itself is the recruiting artifact — there is deliberately no resume
download anywhere in it.

## Tech Stack

- **Framework:** Next.js (App Router, React Compiler)
- **Styling:** Tailwind CSS + CSS custom properties (dark/light themes)
- **Motion:** Framer Motion, plus CSS keyframes for the project covers
- **3D background:** three.js / @react-three/fiber
- **Deployment:** AWS Amplify

## Getting Started

To run this project locally:
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

Checks:
```bash
npx eslint .
npm run build
```

## Page order

Content order is set in `app/page.js`, and the navbar, scroll spy and mobile
menu all read from the same list in `components/Navbar.js`:

1. Hero / Overview
2. About — engineering story, three identity pillars, "Beyond the code" photo strip
3. Education
4. Experience
5. Skills
6. Featured Projects
7. Awards & Recognition
8. Certifications
9. Contact

## Content

`lib/data.js` is the single source of truth for every piece of content. Nothing
in the components hardcodes copy, metrics or asset paths.

## Images

All image slots degrade gracefully: a missing file never renders as a broken
image. Each directory documents its own filenames.

| Directory                     | Fallback when a file is missing                                  |
| ----------------------------- | ---------------------------------------------------------------- |
| `public/images/projects/`     | A project-specific drawn SVG cover (`visualType` in `lib/data.js`) |
| `public/images/photos/`       | A designed placeholder tile carrying the same caption             |
| `public/images/awards/`       | A designed recognition mark built from the institution's logo     |
| `public/images/logos/`        | A neutral monogram tile                                           |
| `public/images/certifications/` | (Present — official badge assets)                               |

See the `README.md` in each directory for exact filenames and export sizes.

## Deployment

This project is deployed using [AWS Amplify](https://aws.amazon.com/amplify/). Amplify provides continuous deployment from the GitHub repository with automatic builds on every push.

## Project Structure
```
app/
├── page.js         # Section order for the whole site
├── layout.js       # Root layout, fonts, metadata
└── globals.css     # Theme tokens, component classes, keyframes
components/         # One file per section, plus ui/ primitives
hooks/              # Pointer, media query, reduced motion, mounted
lib/data.js         # All content
public/images/      # Asset slots, each with its own README
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
