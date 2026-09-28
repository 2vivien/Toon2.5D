# Toon2.5D

Toon2.5D is a TypeScript avatar engine for real-time stylized 2.5D characters on the web.

The visual style is 2.5D; the runtime uses real-time 3D rendering behind a semantic API. Applications do not need to manipulate Three.js morph targets directly.

## V1.0.0

The V1 contract is implemented and released on `main`.

### Runtime

- deterministic create/load/update/render/resize lifecycle;
- pause/resume and safe destruction;
- stale asynchronous-load protection;
- renderer ownership and explicit GPU resource disposal.

### Character and expressions

- semantic facial parameter model;
- emotion composition;
- lip-sync and blink sources;
- constrained damped LookAt for head and eyes;
- persistent external face overrides;
- slot-based character customization.

### Animation

- deterministic keyframe clips;
- state machine with parameters, triggers, conditions and transitions;
- crossfade and weighted multi-clip blending;
- runtime-driven animation advancement.

### Rendering

- Three.js WebGL renderer;
- WebGPU adapter;
- orthographic and perspective cameras;
- semantic GLB morph-target binding;
- shared renderer/context support;
- quality tiers and visibility/FPS adaptation.

### Tooling

- React adapter;
- interactive Studio preview;
- reproducible Blender reference GLB pipeline;
- strict TypeScript;
- Vitest unit/integration coverage;
- Playwright browser release gates.

## Packages

| Package | Purpose |
| --- | --- |
| `@toon2.5d/core` | framework-agnostic runtime, expressions, camera, customization and contracts |
| `@toon2.5d/animation` | clips, players, blending and state machines |
| `@toon2.5d/renderer-three` | Three.js WebGL/WebGPU rendering adapters |
| `@toon2.5d/react` | React lifecycle and canvas integration |
| `@toon2.5d/assets` | asset manifests, validation, registry and cache |
| `@toon2.5d/studio` | reusable interactive Studio surface |

All publishable packages are versioned `1.0.0`.

## Validation

The release pipeline verifies:

1. workspace build;
2. strict TypeScript typecheck;
3. unit/integration tests;
4. Blender reference asset generation and validation;
5. Playwright Studio smoke tests;
6. browser frame-time regression gate;
7. WebGL2 GPU timer signal when timer queries are supported.

The GPU timer check is environment-dependent. Unsupported timer-query environments are not treated as measured results.

## Documentation

- [V1 contract](docs/V1.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Public API](docs/API.md)
- [Rendering](docs/RENDERING.md)
- [Animation](docs/ANIMATION.md)
- [Expression system](docs/EXPRESSION-SYSTEM.md)
- [Asset pipeline](docs/ASSET-PIPELINE.md)
- [Performance](docs/PERFORMANCE.md)
- [Testing](docs/TESTING.md)
- [Security](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)

## Examples

- `examples/vanilla` — framework-free browser integration.
- `examples/react` — React integration.
- `studio` — interactive avatar Studio component.

## Development

Requirements:

- Node.js 22+
- pnpm 10.15+
- Blender for reference-asset validation

Install and validate locally:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm test:browser
```

To keep the runtime reusable, new application integrations should depend on the semantic public APIs instead of reaching into renderer-specific internals.

## V1 boundaries

V1 intentionally does not claim:

- full humanoid skeletal IK;
- arbitrary material-graph authoring;
- DCC replacement;
- server-side WebGL rendering;
- identical GPU performance across every browser and physical device.

These are extension areas, not requirements for the V1 runtime contract.
