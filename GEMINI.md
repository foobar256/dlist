# Dlist

This repository contains a Next.js application using Next.js, tRPC, Drizzle ORM, Tailwind CSS, and Better Auth.
Follow these guidelines when reading, writing, or modifying code in this repository.

## Project Structure

- **Framework**: Next.js v15.2.3 (App Router)
- **Language**: TypeScript v5.8.2 (Strict mode, ES2022)
- **Styling**: Tailwind CSS v4.0.15
- **Database**: SQLite (via Drizzle ORM v0.41.0)
- **API**: tRPC v11.0.0
- **Auth**: Better Auth v1.3
- **Package Manager**: Bun v1.3.5

## Build & Validation Commands

Always run validation commands after making changes to ensure code quality.

### Development
- Start dev server: `bun run dev`
- Build for production: `bun run build`
- Start production server: `bun run start`

### Code Quality & Formatting
- **Lint & Format**: `bun run check:write`
  - Uses **Biome** (v2.2.5) for both linting and formatting.
  - Automatically fixes import sorting and formatting issues.
  - Run this before every commit.
- **Type Check**: `bun run typecheck`
  - Runs `tsc --noEmit`.
  - Must pass with `strict: true` and `noUncheckedIndexedAccess: true`.

### Database
- Push schema changes: `bun run db:push`
- Open database studio: `bun run db:studio`
- Generate migrations: `bun run db:generate`
- Migrate: `bun run db:migrate`

### Testing
- **Runner**: `bun test`
- **Location**: Co-located with source files (e.g., `src/lib/hello.test.ts`) or in `tests/` directory.
- **Convention**: Use `bun:test` for assertions.
  ```typescript
  import { expect, test } from "bun:test";
  import { hello } from "./hello";

  test("hello returns greeting", () => {
    expect(hello("World")).toBe("Hello, World!");
  });
  ```

## Code Style & Conventions

### Imports
- **Alias**: Use `~/` to refer to the `src/` directory.
  - Example: `import { api } from "~/trpc/server";`
- **Organization**: Imports are automatically sorted by Biome.
  - Grouping: External libraries first, then internal modules.
  - Do not manually re-order; let `bun run check:write` handle it.

### TypeScript
- **Strictness**: Enable `strict` mode. Handle `null` and `undefined` explicitly.
- **Safety**: Avoid `any`. Use `unknown` if necessary and narrow types.
- **Config**: `verbatimModuleSyntax` is enabled.

### Components (React/Next.js)
- **Syntax**: Use functional components with `export default`.
- **Server Components**: Default in App Router. Use `"use client"` only when needing interactivity (hooks, event listeners).
- **Server Actions**: Use inline `"use server"` for form actions or separate server action files if complex.
- **Props**: Define props interfaces explicitly.
  ```tsx
  interface MyComponentProps {
    title: string;
    isActive?: boolean;
  }
  
  export default function MyComponent({ title, isActive }: MyComponentProps) {
    return <div className={isActive ? "block" : "hidden"}>{title}</div>;
  }
  ```

### Database (Drizzle ORM)
- **Location**: Schema definitions in `src/server/db/schema.ts`.
- **Naming**:
  - Tables: `snake_case` in DB, `camelCase` variable name.
  - Columns: `camelCase` in TS.
- **IDs**: Use `crypto.randomUUID()` for text-based IDs (User, Session). Use `autoIncrement` integer for others (Post, Game).
- **Timestamps**:
  - `createdAt`: `d.integer({ mode: "timestamp" }).default(sql\`(unixepoch())\`)`
  - `updatedAt`: `d.integer({ mode: "timestamp" }).$onUpdate(() => new Date())`

### Styling (Tailwind)
- Use standard Tailwind utility classes.
- Use `clsx` or `cn` helper (if available) for conditional class names.
- Avoid arbitrary values (`w-[123px]`) unless absolutely necessary.

### Error Handling
- **tRPC**: Handle errors on the client using `onError` callbacks or `try/catch` in async functions.
- **Server Actions**: Return structured error objects or throw errors that can be caught by the UI.
- **Env Vars**: Validated via `src/env.js`. Access them via `env` import.

## Workflow for Agents

1.  **Analyze**:
    - Read `package.json` to verify dependencies.
    - Read `src/server/db/schema.ts` before writing queries.
    - Check `src/app` structure to understand routing.

2.  **Implement**:
    - Make changes ensuring strict type safety.
    - Use `~/` for imports.
    - If modifying DB schema, run `bun run db:push` to apply changes (ask user first if destructive).

3.  **Verify**:
    - Run `bun run check:write` to format code.
    - Run `bun run typecheck` to catch type errors.
    - Run `bun test` to ensure no regressions.
    - Attempt to build `bun run build` if major changes were made.

4.  **Tests**:
    - Create new tests for any new logic added.
    - Ensure existing tests pass.
