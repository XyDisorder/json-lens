# =====================================================
#  JSONLens — Cursor Architecture & Code Quality Rules
# =====================================================

These rules define how Cursor must generate, modify, and structure
the entire JSONLens project.  
They MUST be respected unless explicitly overridden.

=====================================================
=                    PROJECT GOAL                   =
=====================================================
JSONLens is a developer tool designed to explore, inspect, and
transform JSON data.

Main features:
- JSON input with validation
- Collapsible tree representation
- Dot-notation path extraction
- Automatic TypeScript type generation
- Minimal schema generation
- Clean UI with tabs for each view
- 100% client-side Next.js app

Keep the project **simple**, **clean**, **fast**, and **predictable**.

=====================================================
=               GLOBAL TECH REQUIREMENTS            =
=====================================================
- Next.js 14 (App Router)
- TypeScript (strict mode)
- React functional components
- TailwindCSS with utility-first design
- Pure recursion for JSON operations
- No server components unless necessary
- No backend, no external APIs
- No JSON tree third-party libs

=====================================================
=                  ARCHITECTURE RULES               =
=====================================================

Project structure (MUST be followed):

/app
  /jsonlens
    page.tsx        → main UI
  layout.tsx
  page.tsx          → redirect to /jsonlens
/components
  JsonInput.tsx     → textarea + validation
  JsonTree.tsx      → collapsible tree
  JsonPaths.tsx     → path explorer
  TsTypesView.tsx   → TS type generator output
  SchemaView.tsx    → schema display
  Tabs.tsx          → generic tab component
/lib
  treeBuilder.ts    → build internal tree structure
  jsonToPaths.ts    → extract dot paths
  jsonToTs.ts       → generate TypeScript types
  jsonToSchema.ts   → minimal schema generation
/styles
  globals.css
tailwind.config.js
postcss.config.js

Rules:
- Each feature belongs to its own file in `/lib`.
- UI components never contain core logic.
- JSON parsing & logic NEVER live inside UI components.
- All views are pure, deterministic rendering.
- Keep each file focused and minimal.

=====================================================
=                 CODE STYLE GUIDELINES            =
=====================================================

TypeScript:
- NO `any`, NO `unknown`
- Use `type` aliases instead of `interface` (unless extending)
- Always type function params & return types explicitly
- Prefer pure functions
- Use union types for JSON primitives:
  type JSONPrimitive = string | number | boolean | null;

React:
- Only functional components
- Never use class components
- Avoid global React state; prefer local `useState`, `useRef`
- Never store heavy data in React state (store parsed JSON or tree in `useMemo`)
- No unnecessary re-renders

UI:
- TailwindCSS only
- No inline styles except for dynamic values
- Components must remain small (<150 lines)
- Tabs must be reusable

Canvas:
- None for this project (JSONLens stays UI-based)

=====================================================
=                  LOGIC RULES (LIB)               =
=====================================================

JSON parsing:
- Use try/catch with clear error messages
- Never mutate input JSON
- All computation MUST be pure & deterministic

treeBuilder.ts:
- Recursively convert JSON → internal tree structure
- Each node: { key, path, type, children? }
- No side effects

jsonToPaths.ts:
- Recursively generate dot paths
- Paths must be sorted alphabetically

jsonToTs.ts:
- Infer TypeScript types using deterministic rules
- Convert object keys to required properties
- Arrays must detect homogeneous types
- Root type always named `Root`
- Output must be stable, readable, and nicely formatted

jsonToSchema.ts:
- Minimal schema:
  { type: "object" | "array" | "string" | "number" | "boolean" | "null", children?: [...] }

=====================================================
=                 QUALITY & CLEANLINESS             =
=====================================================

Cursor must:
- Use descriptive variable names
- Avoid duplication (DRY)
- Avoid dead code
- Keep diffs minimal & focused
- Add short comments only when needed
- Respect the architecture boundaries
- Prefer readability over cleverness

=====================================================
=                    AI INSTRUCTIONS                =
=====================================================
When generating code:
1. Think step-by-step.
2. Produce a short internal plan BEFORE writing the diff.
3. Modify only relevant files.
4. Never break existing behavior.
5. Ask a clarification question if the request conflicts with these rules.

=====================================================
=                     END OF RULES                  =
=====================================================