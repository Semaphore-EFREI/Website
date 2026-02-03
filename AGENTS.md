# Repository Guidelines

## Project Structure & Module Organization
Key locations in this Vite + Vue 3 + Pinia frontend:
- `src/App.vue` and `src/main.js` bootstrap the app.
- `src/router/index.js` defines routes.
- `src/views/` holds route-level pages (PascalCase filenames like `Calendrier.vue`).
- `src/components/` contains reusable UI components (PascalCase filenames like `Sidebar.vue`).
- `src/stores/` contains Pinia stores (lowercase module files like `users.js`).
- `src/assets/` stores global CSS, fonts, images, and JSON assets.
- `tests/` contains ad-hoc Python scripts and is not wired into npm test runs.

## Build, Test, and Development Commands
```bash
npm install
npm run dev
npm run build
npm run preview
```
- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server at `http://localhost:5173`.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.

## Coding Style & Naming Conventions
- Use 2-space indentation and single quotes in JavaScript to match existing files.
- Vue components and views use PascalCase filenames.
- Store modules use lowercase filenames.
- Keep shared CSS in `src/assets/` and import it where needed (see `src/main.js`).

## Testing Guidelines
- No JavaScript test framework or coverage tooling is currently configured.
- When adding tests, introduce a runner and document the new `npm test` command in `package.json` and this file.
- For now, document manual verification steps in PRs (e.g., login flow, calendar views, user pages).

## Commit & Pull Request Guidelines
- Recent commits are short and version- or summary-oriented (e.g., `V2.6`, `V2-6.c`, `Update UtilisateurEdit.vue`). Follow this concise, descriptive style.
- PRs should include a clear summary, testing notes (manual or automated), and screenshots for UI changes.

## Configuration & Security Notes
- The API base URL is hardcoded in `src/stores/apiClient.js` (`https://semaphore.deway.fr`). No environment variables are required locally.
- Do not commit credentials, tokens, or real user data. Use placeholders for examples.
