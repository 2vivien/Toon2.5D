# Technology Stack

## Runtime

- TypeScript: primary language.
- Three.js: 3D scene/rendering abstraction.
- WebGL: initial browser graphics backend through Three.js.
- glTF/GLB: canonical 3D asset interchange/runtime format.
- Web APIs: requestAnimationFrame, ResizeObserver, Pointer Events, Page Visibility where appropriate.

## Build

- pnpm workspaces.
- TypeScript project references where useful.
- tsup or an equivalent modern bundler for library packages.
- Vitest for unit tests.
- Playwright for browser integration tests.
- ESLint + Prettier.
- Changesets for package versioning when publishing multiple packages.

## Package policy

Core packages must not ship unnecessary framework dependencies.

Recommended dependency direction:

```
core
  ^
  |
assets
  ^
renderer-three
  ^
react
```

In practice, dependencies must form a DAG and no package may import an adapter package.

## Asset pipeline

- Blender for modeling, rigging, blendshapes and animation authoring.
- glTF/GLB export for runtime.
- Draco or Meshopt compression when profiling demonstrates benefit.
- KTX2/Basis Universal textures when the target/browser pipeline supports them and the added complexity is justified.
- CDN/object storage for large asset packs in production.

## Tooling rules

- Node.js LTS for development and CI.
- Lockfile committed.
- Reproducible builds.
- No runtime network dependency for the core engine.
- Browser compatibility must be tested on the declared support matrix.

## Why Three.js

Three.js provides mature scene, camera, material, animation and WebGL integration. Toon2.5D differentiates itself at the avatar-runtime layer rather than reimplementing a graphics API.

## Future options

WebGPU, worker rendering, React Native, native mobile renderers and server-side asset preprocessing are future adapters, not V0 requirements.
