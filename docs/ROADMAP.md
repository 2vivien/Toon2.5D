# Roadmap

## Phase 0 — Architecture — substantially complete

- repository standards
- package boundaries
- TypeScript contracts
- renderer abstraction
- asset manifest
- mathematical conventions
- performance budgets
- research and architectural decisions

## Phase 1 — Minimal Runtime — complete for V0

- runtime lifecycle
- renderer scene ownership
- orthographic camera
- Three.js renderer
- resource disposal
- resize/dispose

## Phase 2 — First Head — in progress

- deterministic reference head GLB
- 52 semantic facial morphs
- skin, eyes and mouth fallback
- asset manifest resolver
- GLB morph binding
- production customization composition

Hair/accessory composition and the full character definition resolver remain future work.

## Phase 3 — Face Runtime — substantially complete

- semantic facial contract
- expression composer
- emotion
- blink
- lip-sync
- look-at
- external overrides
- facial constraints
- renderer morph application

Dedicated head-pose/look-at bones remain future work.

## Phase 4 — Animation — partially complete

Implemented:

- keyframes
- deterministic AnimationPlayer
- interpolation
- looping
- ExpressionSource adapter

Remaining:

- runtime integration examples
- state machine
- transitions
- crossfading
- multi-clip blending
- animation events
- idle/head-pose animation

## Phase 5 — React — foundation complete

Implemented:

- React adapter
- canvas lifecycle
- runtime scheduling
- deterministic cleanup

Remaining:

- Next.js example
- browser integration tests
- shared renderer/context
- visibility throttling
- richer prop facade

## Phase 6 — Performance — foundation in place

Implemented:

- reusable expression buffers
- deterministic animation buffers
- asset compression support
- reference asset generation/validation
- benchmark scaffold

Remaining:

- shared renderer
- asset cache
- quality tiers
- browser/GPU regression gates
- many-avatar benchmarks

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

Do not publish a public stable API before the first end-to-end vertical slice is working, browser-tested and benchmarked.
