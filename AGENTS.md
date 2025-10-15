# Repository Guidelines

## Project Structure & Module Organization
- Landing experience lives in `index.html`, `test.html`, `contact.html`, and `results.html`; each page pairs with a focused JS file (`script.js`, `test.js`, `contact.js`, `results.js`).
- Visual styling is centralized in `styles.css`, while shared effects such as the matrix rain are in `matrix.js`.
- All serverless logic sits in `api/` (`generate-results.js`, `save-to-sheets.js`, `send-gift.js`) and is deployed as Vercel functions. Keep any new endpoint co-located there.
- Deployment rules and rewrites reside in `vercel.json`; keep routes in sync when adding pages or renaming assets.

## Build, Test, and Development Commands
- `python -m http.server 8000` — quick static preview at `http://localhost:8000` for HTML/CSS/JS changes.
- `npx serve .` — alternative local server with caching disabled (helps when validating asset changes).
- `npx vercel dev` — emulates Vercel routing plus `api/` functions; use this before shipping backend updates.
- `vercel` — deploys the current branch; confirm environment variables first.

## Coding Style & Naming Conventions
- Use four-space indentation and favor `const`/`let` with descriptive camelCase identifiers in JS (`scrollToTest`, `createParticleEffect`).
- Keep HTML IDs and classes kebab-cased (`hero-section`, `benefit-card`) to match existing selectors.
- Co-locate utility CSS/JS near the feature they support and document non-obvious logic with a single-line comment.
- Serverless files follow kebab-case filenames; export a single async handler per file using ESM syntax.

## Testing Guidelines
- Automated tests are not yet in place; perform manual passes on `index.html`, `test.html`, and the results flow using `python -m http.server` or `npx vercel dev`.
- Validate API calls in the browser devtools network tab and confirm graceful failure when OpenRouter or Google Sheets keys are missing.
- Before merging, smoke-test on mobile and desktop breakpoints to preserve glassmorphism and matrix effects.

## Commit & Pull Request Guidelines
- Follow the existing history: imperative, concise subjects (`Add social links`, `Fix: Add vercel.json routing`) and group related changes per commit.
- PRs should explain the user-facing outcome, list affected files or routes, attach screenshots/GIFs for visual tweaks, and link tracking issues or Vercel previews.

## Configuration & Secrets
- Environment setup lives in `ENV_SETUP.md`; API key instructions for Sheets automation are in `GOOGLE_SHEETS_SETUP.md`.
- Required variables: `OPENROUTER_API_KEY` and `SITE_URL` for AI calls, plus Google Sheets credentials when enabling `save-to-sheets.js`.
- Never commit secrets; use `vercel env add` and local `.env` files ignored by Git instead.
