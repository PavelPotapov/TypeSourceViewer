# TypeSourceViewer — Project Rules

## Project Overview

Open-source library for extracting TypeScript type definitions as strings at build time.
Core use case: documenting arbitrary TypeScript types in Storybook MDX pages.

Architecture: **Hexagonal (Ports & Adapters)** — pure core with zero dependencies,
framework integrations as separate entry points.

## Package Manager

pnpm for everything. No npm, no yarn.

## TypeScript Best Practices

### Core Principles
- Functional style, no classes
- `interface` over `type` (except unions, intersections, mapped types)
- Avoid `any` — use `unknown` + type narrowing
- Avoid `enum` — use `as const` objects + derived types
- Strict mode always on

### Naming Conventions
- **PascalCase**: types, interfaces, components
- **camelCase**: variables, functions, parameters
- **kebab-case**: file names, directory names
- **UPPER_SNAKE_CASE**: constants

### Functions
- Short, single-responsibility
- Arrow functions for simple expressions
- Early returns, guard clauses
- RORO pattern (Receive Object, Return Object) for 3+ params

### Error Handling
- Explicit failure over silent defaults
- `Result<T, E>` pattern for expected errors
- Throw only for unexpected/unrecoverable errors

## Hexagonal Architecture Rules

### Core (`src/core/`)
- **ZERO external dependencies** — no `fs`, no `path`, no Node APIs
- Pure functions only: `(input: string) => output: string`
- All I/O goes through port interfaces defined in `src/core/ports.ts`
- Tests import ONLY from core — no mocking needed

### Adapters (`src/adapters/`)
- Implement port interfaces for specific environments (Node.js, browser, etc.)
- Each adapter = one file, one responsibility
- Adapters depend on core, never the reverse

### Integrations (`src/integrations/`)
- Framework-specific wrappers: Vite plugin, Storybook addon, CLI
- Compose core + adapters for specific use cases
- Each integration = separate package.json export entry

### Dependency Rule
```
integrations → adapters → core
     ↓             ↓         ↓
  framework    node/browser  nothing
```
Core NEVER imports from adapters or integrations.
Adapters NEVER import from integrations.

## Project Structure

```
src/
├── core/                    # Pure domain logic
│   ├── parser.ts            # parseTypeFromContent(code, typeName) → string
│   ├── find-declaration.ts  # findDeclarationStart, getDeclarationPrefixLength
│   ├── bracket-tracker.ts   # State machine for bracket/string tracking
│   ├── ports.ts             # FileReaderPort, ScannerPort, OutputWriterPort
│   ├── types.ts             # TypeDeclaration, ScanResult, TypeMap, ParseOptions
│   └── index.ts             # Public API re-exports
├── adapters/
│   ├── node-file-reader.ts  # FileReaderPort via fs
│   ├── mdx-scanner.ts       # ScannerPort — scans MDX for <TypeSourceViewer>
│   └── json-writer.ts       # OutputWriterPort via fs
├── integrations/
│   ├── vite-plugin.ts       # Vite plugin with virtual modules + HMR
│   ├── cli.ts               # CLI entry point
│   └── storybook/
│       ├── TypeSourceViewer.tsx  # React component
│       ├── preset.ts             # Storybook preset
│       └── index.ts
└── index.ts                 # Main entry
```

## Agent Pipeline

For non-trivial changes (3+ files, new features, architectural changes):

```
Research → Plan → Implement → Review → Commit
```

Small changes (typos, single-file fixes) — implement directly.

### When to Run Pipeline
- New module or integration
- Changes to core parser logic
- Architectural decisions
- 3+ files affected

### When NOT to Run Pipeline
- Simple bug fixes (1-2 files)
- Documentation updates
- Git/config operations
- Questions and discussions

## Build & Tooling

- **Build**: tsup (separate configs for node/browser entries)
- **Test**: vitest
- **Lint**: eslint + prettier
- **Package exports**: ".", "./vite", "./cli", "./storybook"

## Documentation

- JSDoc for public API functions
- Comments in Russian are OK
- Update README.md when public API changes
- CHANGELOG.md via commit-and-tag-version

## Commits

- Conventional Commits format
- `feat(core):`, `fix(parser):`, `refactor(adapters):`, etc.
- Short, descriptive messages in English

## Communication Style

- Brief summaries, no repetition
- Ask before each pipeline phase
- Offer alternatives for non-obvious decisions
- Decompose large tasks into phases (max 8-10 files per phase)
