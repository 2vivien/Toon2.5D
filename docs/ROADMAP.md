# Roadmap

## Phase 0 — Architecture

- repository standards
- package boundaries
- TypeScript contracts
- renderer abstraction
- asset manifest
- mathematical conventions
- performance budgets

## Phase 1 — Minimal Runtime

- runtime lifecycle
- scene graph
- camera
- Three.js renderer
- resource ownership
- resize/dispose

## Phase 2 — First Head

- base head GLB
- skin material
- eyes
- mouth
- hair
- accessories
- avatar definition resolver

## Phase 3 — Face Runtime

- blendshapes
- expression controller
- blink
- look-at
- head rotation

## Phase 4 — Animation

- timeline
- state machine
- blending
- idle
- expression transitions

## Phase 5 — React

- React adapter
- Next.js example
- browser integration tests

## Phase 6 — Performance

- shared renderer
- cache
- asset compression
- quality tiers
- benchmark suite

## Phase 7 — Studio

Only after the engine is stable:

- avatar generator
- customization UI
- preview
- save/load definitions
- export

## Phase 8 — Ecosystem

Potential packages:

- @toon2.5d/core
- @toon2.5d/renderer-three
- @toon2.5d/assets
- @toon2.5d/animation
- @toon2.5d/react

Future adapters may include React Native or WebGPU.

## Release philosophy

Do not publish a public stable API before the first vertical slice is working and benchmarked.
