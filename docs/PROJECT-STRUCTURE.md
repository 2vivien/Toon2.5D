# Project Structure

Target monorepo:

```
Toon2.5D/
├── packages/
│   ├── core/
│   ├── renderer-three/
│   ├── assets/
│   ├── animation/
│   └── react/
├── examples/
│   ├── vanilla/
│   ├── react/
│   └── nextjs/
├── assets/
│   ├── manifests/
│   └── source/
├── docs/
├── tests/
├── benchmarks/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Core package

Owns types, runtime state, scene contracts, controllers and lifecycle.

## Renderer package

Owns Three.js implementation.

## Assets package

Owns manifest schema, resolver, loader and cache.

## Animation package

Owns reusable animation primitives.

## React package

Owns React lifecycle integration.

## Examples

Examples are real consumers of the public API. They must not import internal source files.

## Tests

Tests must exercise public contracts where possible. Internal implementation tests are allowed for difficult rendering behavior but should not define the public API.
