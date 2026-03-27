https://www.adamstirtan.net

# Contributing & Developer Guide

This repository hosts the adamstirtan.net personal website (Vite + Vue). Below are notes to help future contributors and automation (human or AI) quickly understand how to work on, test, and deploy the site.

Project layout
- index.html — entry.
- src/ — Vue app source files. Main components live in src/components.
- public/ and assets/ — static assets (favicon, images).
- package.json — npm scripts and dependencies.
- SITE_DOCS.md — project-specific notes (read this first for site goals).

Quick start (local dev)
1. Install dependencies:
   - npm install
2. Run dev server:
   - npm run dev
   - Open http://localhost:5173 (or the port printed by Vite)
3. Build for production:
   - npm run build
   - Preview production build:
     - npm run preview

Testing
- This project currently does not include a test suite. Add unit tests under src/ or a top-level tests/ folder and wire into package.json scripts (e.g., vitest). When adding tests, include instructions here.

Coding & style
- The project uses TypeScript for source files. Respect existing tsconfig settings.
- Keep UI changes isolated to components under src/components. Use small, focused commits and descriptive branch names (e.g., feat/header-fix).

Site content & edits
- The terminal-style homepage is built from src/components/Terminal.vue. Edit lineConfigs in that file to change content visible on the main page.
- For content changes that are copy-only, prefer an editorial branch and a short PR describing the copy updates.

Assets
- Add optimized images to assets/ or public/ and reference them from components. Prefer WebP/AVIF where supported.

Deployment
- The site is static and can be hosted on Netlify, Vercel, GitHub Pages, or similar. The build output is in dist/ after `npm run build`.

Automation (AI agents and scripts)
- If an automated agent (script or AI) modifies the repo, follow these practices:
  - Create a feature branch for changes and open a PR (do not push directly to master/main).
  - Include a clear PR description and run `npm run build` locally; attach build output if relevant.
  - Do not commit secrets (API keys, tokens) into the repo. Use environment variables for runtime secrets.

Housekeeping
- Update SITE_DOCS.md with any site-specific notes or conventions you rely on.
- Keep README.md up to date with any new scripts or workflows you add.

If you want, I can also:
- Add a simple CI workflow (GitHub Actions) to run `npm install` and `npm run build` on PRs.
- Add a preview deploy step (Netlify or Vercel) configuration.
- Add a minimal test harness (Vitest) and sample unit test for Terminal.vue.

— Dex