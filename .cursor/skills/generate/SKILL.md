---
name: generate
description: Scans the repository to infer the repo’s actual coding conventions, then generates a concise “Coding Practices & Rules” document plus suggested Cursor rules under .cursor/rules. Use when the user asks to generate repo rules, scan for conventions, create coding standards, or run /generate.
---

# /generate — Repo Coding Practices & Rules

## What to produce

1. **Repository Coding Practices (human doc)**: a concise, repo-specific ruleset the team can follow.
2. **Cursor rules proposal**: suggested contents for one or more files under `.cursor/rules/` that encode the practices.

## How to scan the repo

### 1) Identify the major surfaces

- Frontend app(s) (e.g. `TaskFlow-API/`)
- Backend service(s) (e.g. `TaskFlow-Backend/`)
- Shared config (root `.gitignore`, CI configs, lint/format configs)

### 2) Infer conventions from evidence (prefer “what exists” over “what’s ideal”)

Look for:

- **Language/module system**: ESM vs CJS, Node version hints, `"type": "module"`.
- **Tooling**: ESLint, Prettier, TypeScript, test runners, build tools.
- **Folder structure patterns**: `src/routes`, `src/models`, `src/services`, etc.
- **API patterns**:
  - Route naming and prefixes (e.g. `/api/...`)
  - Auth strategy (middleware names like `requireAuth`)
  - Response envelope shapes (`{ tasks }`, `{ task }`, `{ message }`)
  - Error handling strategy (status codes + JSON message)
- **Frontend patterns**:
  - API base config (`VITE_API_BASE`)
  - Storage keys, auth token handling
  - State management approach
- **Style**:
  - Quotes, semicolons, trailing commas, line length (from actual files)
  - Naming conventions (constants, functions, components)

### 3) Record both “current rules” and “fixme rules”

If you detect inconsistencies, document:

- **Current observed behavior** (what the repo does now)
- **Proposed standard** (what to enforce going forward)
- **Low-risk migration steps** (optional)

## Output format (must follow)

### A) “Coding Practices & Rules” document

Write it using this template:

- **Project overview**: 2–4 bullets about architecture.
- **Language & tooling**: key packages/commands (scripts).
- **Repo conventions**:
  - **Directory structure**
  - **Naming**
  - **API design**
  - **Error handling**
  - **Validation**
  - **Security**
  - **Frontend data fetching**
  - **Config & env**
- **Inconsistencies found**: list with recommended resolution.

### B) Cursor rules proposal

Create one file at minimum: `.cursor/rules/coding-standards.md`

It should:

- Be concise and enforceable.
- Contain “Do/Don’t” bullets.
- Include repo-specific response shapes, naming, and patterns.

