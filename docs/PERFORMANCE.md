# Performance

Performance is a first-class contract.

## Primary budgets

The engine targets:

- low CPU overhead when idle;
- bounded GPU resource usage;
- minimal allocations in the frame loop;
- one shared renderer/context per application where possible;
- lazy loading of optional assets.

These are architectural targets; V0 does not yet implement every optimization.

## Current V0 rules

Forbidden in hot paths:

- repeated JSON parsing;
- DOM queries;
- React state updates;
- large temporary arrays;
- creating Three.js objects every frame;
- loading assets during render.

The core expression pipeline reuses its output and contribution buffers. Animation integration should preserve the same allocation discipline.

## Memory

Track:

- geometries;
- textures;
- materials;
- animation clips;
- GPU buffers;
- cached GLTF scenes.

Every resource category must have an explicit disposal strategy. Rejected GLB loads must dispose resources created before validation failure.

## Many avatars

The target architecture is:

```
One runtime/renderer
  +
Shared immutable assets
  +
Per-instance transforms/state
```

The current React adapter still creates one renderer per ToonAvatar instance. Shared renderer/context management is future work.

## Quality tiers

Low, medium and high quality profiles are planned. V0 exposes configurable pixel ratio but does not yet provide complete quality presets.

## DPR

The Three.js adapter caps configured pixel ratio to avoid unnecessarily expensive rendering on high-density displays.

## Visibility

Applications can explicitly call pause() and resume(). Automatic visibility-based throttling is not implemented in the current React adapter.

## Profiling

Measure before optimizing. Every optimization should have benchmark or profiling evidence.

Track:

- frame time;
- CPU update time;
- GPU frame time where available;
- asset download size;
- decode time;
- JS heap;
- GPU memory where measurable;
- time to first rendered avatar.

## Performance gates

Performance regression thresholds are a release requirement but are not yet enforced as CI failure gates for browser/GPU measurements.
