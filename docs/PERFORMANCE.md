# Performance

Performance is a first-class contract.

## Primary budgets

The engine targets:

- low CPU overhead when idle
- bounded GPU resource usage
- minimal allocations in the frame loop
- one shared renderer/context per application where possible
- lazy loading of optional assets

## Frame loop rules

Forbidden in hot paths:

- repeated JSON parsing
- DOM queries
- React state updates
- large temporary arrays
- creating Three.js objects every frame
- loading assets during render

## Memory

Track:

- geometries
- textures
- materials
- animation clips
- GPU buffers
- cached GLTF scenes

Every resource category must have an explicit disposal strategy.

## Many avatars

For many avatars, prefer:

```
One runtime/renderer
  +
Shared immutable assets
  +
Per-instance transforms/state
```

Do not create a WebGL context per avatar.

## Quality tiers

Conceptually:

- low: reduced DPR, simplified effects
- medium: standard quality
- high: higher DPR and effects

The exact thresholds are runtime/device dependent and must be benchmarked.

## DPR

Cap device pixel ratio:

```
effectiveDPR = min(devicePixelRatio, configuredMaxDPR)
```

This prevents unnecessarily expensive rendering on high-density displays.

## Visibility

When the host is not visible, the runtime may pause or reduce update frequency.

## Profiling

Measure before optimizing. Every optimization should have a benchmark or profiling evidence.

Track:

- frame time
- CPU update time
- GPU frame time where available
- asset download size
- decode time
- JS heap
- GPU memory where measurable
- time to first rendered avatar

## Performance gates

CI should eventually reject regressions beyond documented thresholds for representative scenes.
