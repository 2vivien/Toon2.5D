# Project Structure

The V0.1 pnpm workspace uses explicit root-level package directories.

```
Toon2.5D/
├── core/
├── renderer-three/
├── assets/
├── animation/
├── react/
├── examples/
│   ├── vanilla/
│   └── react/
├── tests/
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Package ownership

Core owns domain types, runtime state, scene contracts, expression control and lifecycle.

Renderer-three owns Three.js, GPU resources, GLTF loading and rendering.

Assets owns manifests, validation, asset identity and registry contracts.

Animation owns timelines, interpolation, playback and expression-source adaptation.

React owns framework lifecycle integration only.

## Boundary rule

Examples consume public package APIs. They must not import renderer internals or mutate engine state directly.

Tests prefer public contracts and deterministic pure functions.