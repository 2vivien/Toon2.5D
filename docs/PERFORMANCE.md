# Performance

Performance is a first-class runtime contract.

## Budgets

The engine targets:

- bounded CPU work in the frame loop;
- bounded GPU resource ownership;
- minimal hot-path allocations;
- shared renderer/context operation;
- lazy asset loading;
- adaptive pixel ratio under load.

## Hot-path rules

Forbidden:

- JSON parsing;
- DOM queries;
- React state updates;
- large temporary allocations;
- Three.js object creation;
- asset loading.

The expression and animation pipelines reuse buffers.

## Memory ownership

Instance state is separated from renderer-owned resources. GLB replacement, rejected loads, customization swaps and scene disposal release owned geometry, materials and textures.

The asset cache bounds retained resources by byte budget and reference count.

## Quality and throttling

DynamicQualityController selects Low/Medium/High/Ultra from visibility and exponentially smoothed frame rate. The React adapter uses IntersectionObserver and only advances/render frames while visible.

## Shared rendering

SharedThreeRenderer keeps multiple avatar scenes on one Three.js context and exposes renderFrame() for host-controlled frame coordination. Individual runtime render calls register their scene; the shared frame renders the renderer-owned scene once.

## Profiling

Track frame time, CPU update time, GPU time where supported, asset load/decode time, JS heap and GPU resource counts. Browser CI enforces deterministic software-visible budgets; physical GPU benchmarks remain deployment-specific.
