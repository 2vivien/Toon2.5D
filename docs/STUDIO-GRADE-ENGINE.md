# Studio-Grade Engine

The production engine extends the original V0 runtime without changing the renderer-agnostic core boundary.

## Runtime pipeline

Animation state machine and multi-clip sources feed the same deterministic expression composer used by emotion, blink, lip-sync, LookAt and external overrides. Runtime advances sources from one frame delta, applies semantic constraints, then sends final face weights to the renderer.

## Animation

State definitions support loop, speed, enter/exit callbacks, parameter conditions, triggers and transition callbacks. A transition exposes two weighted clip outputs during its duration. The multi-clip player can superpose arbitrary tracks using per-layer weights.

## Character customization

Customization is slot based. Each slot can receive a GLB asset and/or texture. Renderer-owned resources are disposed when replaced or destroyed.

## Camera and LookAt

Three.js supports orthographic and perspective projection. Perspective state validates FOV, aspect and clip planes. LookAt uses constrained yaw/pitch and exponential damping, then applies semantic expression weights plus dedicated Head/Eye bone quaternions when those bones exist.

## Asset lifecycle

The cache provides async preload, acquire/release reference counts, byte-budget eviction, invalidation and deterministic disposal.

## Shared rendering and quality

SharedThreeRenderer coordinates multiple avatar scenes on one WebGL Three.js context. WebGPUAvatarRenderer provides the same renderer contract through Three.js WebGPU initialization. DynamicQualityController reacts to visibility and measured frame time and selects Low, Medium, High or Ultra pixel-ratio tiers. React integrates IntersectionObserver and the controller without placing React state in the frame loop.

## Studio

@toon2.5d/studio is a real React preview surface backed by the same runtime and Three renderer. It exposes live facial controls and animation preview.

## Release gates

CI runs:
- strict TypeScript build and typecheck;
- unit and integration tests;
- Blender reference GLB generation and morph validation;
- real headless Chromium Studio render;
- canvas output check;
- frame-time p95 budget;
- repeated-mount observable heap-growth check.

These gates validate deterministic software behavior; they do not claim identical GPU performance across physical hardware.