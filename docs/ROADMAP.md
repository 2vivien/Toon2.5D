# Roadmap

## Studio-grade engine — complete

Implemented and integrated:

- deterministic animation state machine with triggers, parameters and transition callbacks;
- crossfade transitions and weighted multi-clip blending;
- slot-based character customization with GLB and texture swaps;
- perspective camera with validated projection state;
- damped constrained head/eye LookAt with dedicated bone application;
- bounded async asset cache with preload, reference counting, invalidation and eviction;
- shared Three.js renderer/context frame coordination;
- Low/Medium/High/Ultra quality tiers and visibility/FPS adaptation;
- Playwright browser smoke/visual capture, frame-budget and GPU-timer release gates;\n- executable documentation consistency and repeated-mount heap-growth gates;\n- WebGL context-loss/restoration recovery;\n- WebGL/WebGPU Renderer contract parity for camera, LookAt, customization and quality;\n- versioned asset manifests with integrity, origin and complexity limits;\n- composable CharacterDefinition and stable asset-ID resolution;\n- native GLB AnimationMixer/AnimationAction access and deterministic event timelines;\n- shared multi-avatar render scheduling;\n- Studio authoring panels, project export and performance benchmarks;\n- Changesets-based release workflow, npm provenance configuration and MIT licensing;
- interactive React Studio preview;
- strict TypeScript, lifecycle disposal and integration tests.

## Deliberate non-goals

The engine does not claim identical GPU timings across physical hardware. Hardware-specific profiling remains an application/deployment concern.

## Next engineering work

Future work is additive rather than required to complete the current studio-grade engine:

- richer humanoid IK;
- GPU-specific profiling adapters;
- persistent asset manifests and CDN tooling;
- expanded Studio panels and authoring workflows;
- animation event timelines;
- production release packaging and provenance signing.
