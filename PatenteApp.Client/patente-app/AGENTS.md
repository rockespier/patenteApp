# Repository Guidelines

## Project Structure & Module Organization

- `src/app/` contains the Angular app, organized by feature:
  - `features/auth/login/` for sign-in and registration
  - `features/quiz/` for the exam flow
  - `features/history/` for past attempts
- Shared infrastructure lives in `src/core/` (`services/`, `guards/`, `interceptors/`, `models/`, `constants/`).
- Global styling is in `src/styles.css`; app shell files are `src/index.html`, `src/main.ts`, and `src/app/app.component.*`.
- Static assets belong in `src/assets/`.
- Environment settings live in `src/enviroments/` and should be treated as configuration, not business logic.

## Build, Test, and Development Commands

- `npm start` runs the Angular dev server on `http://localhost:4200/`.
- `npm run build` creates the production bundle in `dist/`.
- `npm run watch` rebuilds on file changes for local iteration.
- `npm test` runs Karma + Jasmine unit tests.

## Coding Style & Naming Conventions

- Use TypeScript with Angular standalone components.
- Prefer 2-space indentation, single quotes, semicolons, and `PascalCase` for classes/components.
- Use `kebab-case` for file names and folders, for example `quiz.component.ts`.
- Keep templates and styles close to their component and favor existing patterns over introducing new abstractions.

## Testing Guidelines

- Unit tests use Jasmine with Karma.
- Place specs next to the code they cover using the `*.spec.ts` suffix.
- Focus tests on guards, services, and component behavior that can regress silently, especially auth, routing, and quiz submission flows.

## Commit & Pull Request Guidelines

- Recent history uses short, imperative commit messages, often prefixed with `chore:` or descriptive merge titles.
- Keep commits scoped and readable, for example `feat: refine quiz results layout`.
- PRs should include a concise description, linked issue or task when available, and screenshots for UI changes.

## Security & Configuration Tips

- Do not commit secrets or Firebase credentials. Keep environment-specific values in `src/enviroments/`.
- Verify auth and API changes against the guarded routes and interceptors in `src/core/` before merging.
