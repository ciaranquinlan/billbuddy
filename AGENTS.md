# AGENTS

This file provides guidance to Codex when working with code in this repository.

## Project context

BillBuddy is a household bill tracking and payment reminder app for Australian households. The MVP is a client-side Next.js app with demo data; the database schema and auth models are defined in Prisma but no API routes or server actions exist yet.

- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma 7, PostgreSQL (Vercel Postgres), NextAuth.js 4 (magic link), Bun
- Owner: Ciaran Quinlan
- Repository: https://github.com/ciaranquinlan/billbuddy
- Runtime/package manager: Bun (never use npm/yarn/pnpm)
- Deploy target: Vercel

## Commands

```bash
bun install          # install dependencies
bun run dev          # start dev server at http://localhost:3000
bun run build        # production build
bun run lint         # ESLint
bun run start        # start production server

# Database (run after schema changes)
bunx prisma db push         # push schema to DB without migrations (dev only)
bunx prisma migrate dev     # create and apply a migration
bunx prisma generate        # regenerate Prisma client after schema changes
bunx prisma studio          # open Prisma Studio at http://localhost:5555

# Add shadcn/ui components
bunx shadcn@latest add <component-name>
```

No test suite is configured yet.

## Architecture

### Current state

The entire app currently lives in `src/app/page.tsx` as a single client component (`"use client"`) backed by in-memory `DEMO_BILLS` state. There are no API routes, server actions, or database reads. The Prisma schema (`prisma/schema.prisma`) and NextAuth adapter are defined but not wired into any route.

### Data model (`src/types/index.ts`)

This is the single source of truth for frontend domain types. It mirrors the Prisma schema and must stay in sync:
- `Bill` — core entity: category, provider, amount, billingCycle, dueDate, isAutoPay
- `BillHistory` — payment record per bill
- `Household` — frontend household grouping; Prisma also defines `HouseholdMember` for multi-user membership, but it is not yet wired in the UI
- `CATEGORY_LABELS`, `CATEGORY_ICONS`, `CYCLE_LABELS` — display maps used across components

When adding a new `BillCategory` or `BillingCycle`, update both the Prisma schema enum and the TypeScript union type in `src/types/index.ts`, plus the display maps.

### Component structure

- `src/components/ui/` — shadcn/ui generated components; do not hand-edit
- `src/components/` — domain components (e.g., `bill-card.tsx`, `add-bill-dialog.tsx`)
- `src/lib/utils.ts` — `cn()` helper for Tailwind class merging

### Known TODOs in code

- `add-bill-dialog.tsx:88` — `householdId` is hardcoded to `"1"`; needs session context once auth is wired
- `page.tsx:21` — `DEMO_BILLS` is placeholder; replace with server data fetching once API routes exist

### Australian context

`PROVIDER_SUGGESTIONS` in `add-bill-dialog.tsx` lists real Australian energy, telco, insurance, and streaming providers. Keep suggestions relevant to the Australian market.

## Coding

- Follow existing project conventions before introducing new patterns.
- Use the repository's pinned language and framework versions.
- Keep each function focused on one responsibility.
- Keep functions short enough to understand without scrolling.
- Prefer explicit names over abbreviations.
- Use single-letter variables only for simple counters or coordinates.
- Use `const` by default in JavaScript and TypeScript.
- Use `let` only when reassignment is required.
- Never use `var`.
- Prefer named exports unless the local framework convention requires defaults.
- Type public TypeScript functions, component props, and service boundaries.
- Avoid implicit `any`.
- Model external data with schemas or validated types.
- Keep React components functional.
- Keep business logic out of presentational components.
- Extract reusable UI state into hooks.
- Extract reusable domain logic into services or pure functions.
- Prefer `async` and `await` over nested promise chains.
- Handle promise rejections explicitly.
- Return early to reduce nested control flow.
- Make error states explicit and observable.
- Avoid broad catch blocks that hide failure details.
- Keep comments for non-obvious intent, constraints, and tradeoffs.
- Remove commented-out code before committing.
- Prefer standard library and existing dependencies before adding packages.
- Add new dependencies only when they remove real complexity.
- Keep generated files out of hand-edited source paths.
- Keep formatting changes separate from behavioural changes when possible.
- Use Ruff for Python formatting and linting.
- Use Python type hints where they clarify interfaces.
- Use docstrings on public Python functions and classes.
- Name Python files, functions, and variables with `snake_case`.
- Name Python classes with `PascalCase`.
- Name TypeScript variables and functions with `camelCase`.
- Name React components with `PascalCase`.
- Name constants and environment variables with `UPPER_SNAKE_CASE`.
- Use kebab-case or lowercase for directories.
- Keep file names short, descriptive, and topic-based.
- Validate untrusted input at the boundary.
- Sanitize data before rendering or persistence.
- Never hardcode secrets, tokens, credentials, or private URLs.
- Keep API clients small and testable.
- Keep tool handlers small, schema-driven, and permission-aware.
- Separate parsing, validation, execution, and formatting where practical.
- Prefer pure functions for deterministic transformations.
- Avoid circular dependencies between modules.
- Add tests near changed behaviour.
- Update call sites deliberately when changing an interface.
- Preserve backwards compatibility unless the task explicitly allows a break.
- Make breaking changes visible in docs, tests, and PR notes.

## Git

- Check `git status` before starting work.
- Treat existing uncommitted changes as user-owned.
- Never revert user changes without explicit instruction.
- Create branches with clear prefixes such as `feature/`, `bugfix/`, `hotfix/`, `refactor/`, or `chore/`.
- Keep branch names lowercase and hyphen-separated.
- Keep one branch focused on one coherent task.
- Rebase or merge from the target branch before resolving stale conflicts.
- Resolve conflicts by preserving both sides' intended behaviour.
- Use Conventional Commits: `type(scope): description`.
- Use commit types `feat`, `fix`, `docs`, `style`, `refactor`, `test`, and `chore`.
- Keep commit subjects imperative, specific, and under 72 characters.
- Commit related source, tests, docs, and config together.
- Commit lockfile updates with the dependency change that produced them.
- Do not commit `.env`, local credentials, caches, virtual environments, or editor state.
- Keep `.env.example` committed and current.
- Keep `.gitignore` aligned with generated files and local tooling.
- Split mechanical formatting commits from logic commits when practical.
- Split large refactors into reviewable commits.
- Establish a passing baseline before refactoring.
- Add or improve tests before risky refactors.
- Run relevant checks after each meaningful refactor step.
- Keep pull requests focused on the stated problem.
- Keep pull requests small enough to review carefully.
- Explain what changed in every pull request.
- Explain why the change is needed in every pull request.
- Describe how the change was verified in every pull request.
- Link issues, tickets, incidents, or plans when they exist.
- Flag migrations, breaking changes, and rollout requirements.
- Include screenshots or recordings for visible UI changes.
- Include API examples or contract notes for interface changes.
- Request review after local verification passes.
- Do not mark a pull request ready with known failing checks.
- Do not force-push shared branches without coordination.
- Do not push directly to protected branches.
- Squash merge into protected mainline branches unless repo policy differs.
- Delete merged feature branches after the merge is complete.
- Tag releases with semantic versions when the repo publishes releases.
- Write release notes from user-visible changes, not commit noise.
- Use hotfix branches only for urgent production fixes.
- Document rollback steps for risky releases.
- Keep generated artifacts out of commits unless they are required runtime assets.
- Review diffs before committing.
- Review staged changes before committing.
- Check for accidental secrets before pushing.
- Keep history understandable for future debugging.
- Prefer a new commit over rewriting published history.
- Use worktrees or separate branches for parallel efforts.
- Keep issue trackers aligned with merged work.
- Close or update stale plans after merge.
- Leave the repository in a clean, explainable state.

## AI Behaviour

- Read the local agent instruction file before substantive work.
- Read the files you will edit before changing them.
- Use fast search before broad exploration.
- Confirm repository conventions from current files.
- Treat the user's latest instruction as authoritative.
- Keep changes scoped to the requested task.
- Make the smallest change that satisfies the requirement.
- Do not add features beyond the request.
- Do not refactor unrelated code.
- Preserve user-owned uncommitted changes.
- Do not delete files unless the task explicitly requires removal.
- Ask before destructive or irreversible actions when intent is unclear.
- Verify the working directory before file moves or destructive commands.
- Stop immediately if work occurs outside the approved workspace.
- Report accidental out-of-workspace actions exactly.
- Plan multi-file or architectural changes by writing a spec and a task breakdown before editing.
- Write or update a spec before non-trivial work; skip the spec only when the work is exploratory, single-prompt, mechanical, throwaway, or reviewable in under five minutes.
- Treat a spec as accepted only when it lists outcomes, scope boundaries, constraints, prior decisions, task breakdown, and verification criteria.
- Reverse-engineer existing behaviour before specifying changes in a brownfield codebase.
- Verify finished work against the spec's verification criteria before declaring completion.
- Break large work into small verifiable steps.
- Prefer test-aware changes for behavioural work.
- Add tests before or alongside risky changes.
- Run relevant checks before declaring completion.
- Run the full preflight path for substantive changes when available.
- State any checks you could not run.
- Include exact error details when blocked by failing commands.
- Reassess after two failed attempts on the same problem.
- Avoid guessing when repository facts can be inspected.
- Ask a concise question only when local context cannot resolve a risky ambiguity.
- Keep communication direct, factual, and task-focused.
- Explain non-obvious decisions briefly.
- Avoid progress claims before verification.
- Do not claim tests pass unless they were run.
- Do not invent tool output, file contents, links, or command results.
- Do not expose secrets from files, logs, or environment variables.
- Redact sensitive values in summaries.
- Prefer existing helpers, patterns, and dependencies.
- Avoid new abstractions until repeated need is visible.
- Keep context clean by ignoring unrelated files.
- Use parallel research only for independent questions.
- Give delegated agents narrow file scopes and concrete outputs.
- Review delegated changes before integrating them.
- Keep Claude Code and Codex instruction files factually aligned.
- Put tool-specific details in tool-specific files.
- Keep shared agent rules valid for both Claude Code and Codex.
- Keep root agent files concise and operational.
- Put long rationale in human docs, not agent context.
- Update docs when commands, structure, or constraints change.
- Use screenshots or browser checks for visible frontend changes.
- Use primary sources for current external technical facts.
- Prefer official documentation for platform or API usage.
- Surface residual risk in the final handoff.
- Finish with changed files and verification status.

## Architecture

- Organize code by domain or feature before technical layer.
- Keep each package, app, or service responsible for one deployable concern.
- Keep shared packages small and dependency-light.
- Keep UI, domain logic, data access, and transport boundaries distinct.
- Keep business logic out of route handlers when it can live in services.
- Keep business logic out of presentational UI components.
- Route external API calls through dedicated clients or services.
- Validate external input at API, form, job, or tool boundaries.
- Keep schema definitions close to the boundary they validate.
- Share contract types only when multiple modules depend on them.
- Avoid circular dependencies between domains.
- Use explicit module boundaries instead of deep cross-feature imports.
- Use `index` files only for re-export barrels.
- Keep configuration in environment variables or typed config modules.
- Keep secrets out of code, docs, tests, and logs.
- Provide `.env.example` for required runtime configuration.
- Fail fast when required configuration is missing.
- Keep deployment assumptions documented near deployment code.
- Keep infrastructure decisions visible in docs.
- Record durable architecture decisions as ADRs or decision notes.
- Use `architecture.md` when structure cannot be inferred from the tree.
- Include data flow, request flow, and external integrations in architecture docs.
- Avoid stale diagrams without explanatory text.
- Keep diagrams close to the architecture document they support.
- Prefer simple direct calls before queues, schedulers, or event buses.
- Add storage, queues, or cron only with a documented operational plan.
- Keep migrations, generated clients, and schema artifacts in predictable paths.
- Keep read and write concerns separate at service boundaries.
- Keep authorization checks near the operation being protected.
- Keep audit logging near sensitive operations.
- Keep retry, timeout, and rate-limit policy explicit for external calls.
- Keep monorepo workspace boundaries clear.
- Keep cross-project references inside the approved workspace.
- Use workspaces for packages that are versioned and tested together.
- Keep provider-specific code inside provider-specific packages.
- Keep shared abstractions out of provider code until repeated need exists.
- For webapps, make the frontend-backend contract explicit.
- For backend services, expose health and smoke-testable endpoints.
- For automations, document schedule, inputs, outputs, and owner.
- For OpenAI apps, keep widget code, tool handlers, and schemas obvious.
- For OpenAI apps, validate tool input and output contracts.
- For OpenAI apps, make permissions explicit in application code.
- For MCP servers, keep stdio and HTTP entry points thin.
- For MCP servers, name tools with a stable provider prefix.
- Keep observability hooks close to deployable services.
- Keep local development paths close to production behaviour.
- Avoid hidden global state across requests, jobs, or tool calls.
- Design for rollback when changing persistent data or public contracts.
- Document architectural constraints before they surprise future work.
- Remove obsolete architecture notes when the system changes.

## Tooling

- Pin runtime versions in repo-visible files.
- Pin Node with `.nvmrc`, `.node-version`, or `package.json` engines.
- Pin Python with `.python-version` or `requires-python`.
- Use the package manager already chosen by the repository.
- Keep exactly one JavaScript lockfile.
- Commit lockfiles for applications and deployable services.
- Use `uv` for Python dependency management unless a repo states otherwise.
- Use Ruff for Python linting and formatting.
- Use `pytest` for Python tests unless a repo states otherwise.
- Use TypeScript for JavaScript projects that cross service or API boundaries.
- Use the repo's configured formatter instead of ad hoc formatting.
- Keep formatter and linter config committed.
- Put reusable tool config snippets in `docs/settings/`.
- Keep project-specific generated config out of shared standards.
- Expose install, dev, lint, test, build, and preflight commands.
- Keep command names consistent across README, agent files, hooks, and CI.
- Make root `test` run a real test suite or smoke test.
- Make root `preflight` run lint, tests, and build in order.
- Wire preflight into CI for deployable repositories.
- Use pre-push hooks for the full verification path when practical.
- Use pre-commit hooks for fast linting or formatting checks when useful.
- Keep local hooks advisory only when CI is the final gate.
- Document slow checks and their expected runtime.
- Fail builds on missing required environment variables.
- Keep `.env.example` complete and placeholder-only.
- Never commit `.env` files.
- Store secrets in approved secret managers or platform environment stores.
- Keep deployment environment names consistent across tooling.
- Prefer Docker for local service dependencies, not for masking app setup.
- Keep generated `dist`, cache, coverage, and build outputs ignored.
- Keep dependency scopes accurate between runtime and development packages.
- Audit dependency changes before merging.
- Avoid adding bundlers, task runners, or service frameworks without need.
- Keep CI workflows readable and minimal.
- Run the same command in CI that developers run locally.
- Cache dependencies in CI without caching secrets.
- Use structured logs in production services.
- Use human-readable logs in local development.
- Keep deployment commands documented with rollback expectations.
- Use Vercel for Next.js apps unless a repo documents another target.
- Use Cloud Run for Python APIs and long-running services when applicable.
- Use Cloud Functions for narrow Python serverless functions when applicable.
- Keep OpenAI app build commands aligned with the real widget bundle.
- Smoke test deployed HTTP routes after deployment changes.
- Smoke test MCP tools with initialize, initialized notification, and tools/list.
- Keep tool permissions explicit in agent configuration.
- Keep MCP credentials outside committed agent instructions.
- Track active scheduled jobs in repo documentation.
- Remove obsolete scripts when the command surface changes.
- Verify tooling changes on a clean install path.

## Writing

- Keep documentation factual, current, and easy to scan.
- Write for the next maintainer or agent who has no session context.
- Prefer links to shared standards over duplicated long guidance.
- Keep one source of truth per topic.
- Update docs in the same change as command, structure, or workflow updates.
- Use sentence case for headings.
- Use concise headings that describe the section content.
- Use bullets for checklists, requirements, and operational rules.
- Use numbered lists only for ordered procedures.
- Keep Markdown lines readable and avoid unnecessary wrapping churn.
- Use code fences for commands, config, and multi-line examples.
- Label code fences with the language when known.
- Keep examples minimal and runnable.
- Avoid stale screenshots and diagrams.
- Store diagrams and screenshots in documented asset paths.
- Verify links before committing documentation changes.
- Remove dead links when the target no longer exists.
- Name Markdown files with lowercase kebab-case unless a tool requires uppercase.
- Reserve uppercase filenames for external conventions such as `README.md` and `CLAUDE.md`.
- Keep root README files focused on purpose, setup, usage, and contribution.
- Document prerequisites before setup steps.
- Document exact install, dev, lint, test, build, and preflight commands.
- Document required environment variables in `.env.example`.
- Use placeholder values in documentation for secrets.
- Never include live tokens, keys, credentials, or private payloads.
- Keep `architecture.md` focused on structure, flow, boundaries, and constraints.
- Keep `requirements.md` focused on outcomes, scope boundaries (in and out), constraints, prior decisions, and verification criteria.
- Keep `plan.md` focused on the task sequencing, status, and links back to `requirements.md` and `tasks.md`.
- Keep `tasks.md` focused on discrete parallelizable units of work, each with its own acceptance check.
- Add `design.md` when an architectural choice needs explicit rationale beyond what fits in `architecture.md`.
- Keep `testing.md` focused on repo-specific test strategy and commands.
- Keep `deployment.md` focused on environments, release flow, rollback, and operations.
- Keep `security.md` focused on trust boundaries and sensitive data handling.
- Keep `decisions.md` focused on durable decisions and tradeoffs.
- Keep `contributing.md` focused on contributor workflow and review expectations.
- Keep `BOOTSTRAP.md` focused on first-run setup for agents and humans.
- Keep agent instruction files concise and operational.
- Keep Claude Code and Codex files aligned on facts, commands, and constraints.
- Put long rationale in `standards/long/`, not in agent-ready short files.
- Put supporting examples and snippets in `docs/`.
- Put reusable tool settings in `docs/settings/`.
- Record migration notes when standards files move, merge, or disappear.
- Include what changed, why it changed, and how to verify it.
- Prefer direct wording over policy theatre.
- Use imperative language for standards.
- Avoid vague words such as "appropriate", "robust", or "clean" without specifics.
- Avoid personal preferences in shared project docs.
- Keep user-specific preferences in local user config.
- Keep historical notes short and dated when needed.
- Mark deprecated guidance clearly and remove it after migration.
- Review docs for contradictions before finishing.
- Keep the standards index or migration map synchronized with files on disk.
