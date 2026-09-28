# Technology Stack

## Current V1 runtime

- TypeScript 7.0.x with strict compiler settings.
- Three.js 0.186.x for the first renderer adapter.
- WebGL through Three.js as the initial graphics backend.
- glTF/GLB as the canonical runtime asset format.
- pnpm 10.15.x workspaces.
- Vitest 5.x for deterministic tests and benchmarks.
- Blender for deterministic reference-asset generation and validation.

## Package policy

Core packages must not ship unnecessary framework dependencies.

Current dependency direction:

```
core
  ^
  |
  +-- assets
  +-- animation
  +-- renderer-three
          ^
          |
          +-- react
```

The animation package depends on core and adapts animation output into the core ExpressionSource contract. Core never imports an adapter package.

## Asset pipeline

- Blender for modeling, rigging, morph targets and animation authoring.
- glTF/GLB export for runtime.
- Meshopt decoding enabled by the Three.js loader.
- Draco and KTX2/BasisU support when decoder/transcoder configuration is provided.
- CDN/object storage remains a production deployment option.

## Build and verification

Current repository verification uses:

- TypeScript project compilation;
- strict typechecking;
- Vitest unit/integration tests;
- Blender reference asset generation;
- Blender reference asset validation.

The repository currently does not include Playwright, ESLint, Prettier or Changesets as installed release tooling. These remain future tooling options when their corresponding release gates are introduced.

## Runtime principles

- No runtime network dependency for core.
- No React state updates in the frame loop.
- No Three.js dependency in core.
- No hidden telemetry.
- Explicit resource ownership and disposal.
- Reproducible asset generation.

## Future options

WebGPU, worker rendering, React Native, native mobile renderers, browser visual testing and server-side asset preprocessing are future adapters or tooling layers, not V0 requirements.
