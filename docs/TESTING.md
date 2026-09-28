# Testing Strategy

## Unit

The suite covers math, interpolation, expression blending, facial sources, schema validation, asset resolution, animation state machines, multi-clip blending, camera constraints, LookAt and cache lifecycle.

## Runtime integration

Integration coverage includes initialization, animation attachment, state-machine attachment, rendering handoff, resize, pause/resume, explicit overrides, customization lifecycle and deterministic disposal.

## Browser

Playwright runs the real Studio bundle in headless Chromium with SwiftShader. The gate verifies:

- canvas creation and dimensions;
- live Studio controls;
- screenshot capture for visual inspection;
- frame-time budget over a sustained sample window;
- stable remount behavior.

## Visual regression

Browser screenshots are retained as CI artifacts. Canonical visual baselines should be generated in the same pinned Chromium environment before enabling strict pixel-diff promotion.

## Performance

The browser gate measures frame intervals and enforces a p95 frame-time budget. GPU-specific timer availability is detected separately because deterministic GPU timings cannot be guaranteed across CI hosts.

## Asset contract

The Blender reference generator and validator enforce the 52-morph asset contract.

## Deterministic time

Animation tests use explicit elapsed time instead of relying on requestAnimationFrame.

## Failure tests

Coverage includes malformed animation timing, duplicate state/layer identifiers, invalid camera values, invalid customization URLs, duplicate loads and renderer scene disposal.

## Release gate

A stable release requires build, strict typecheck, unit/integration tests, reference asset validation and browser performance/smoke gates.
