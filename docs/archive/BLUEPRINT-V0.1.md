# Toon2.5D — Studio-Grade Engine Blueprint

Status: implemented production-grade foundation

The engine is framework-independent at its core and uses Three.js as a renderer adapter. The same runtime powers applications, React and Studio.

## Runtime pipeline

Input
→ animation state machine / clip blending
→ LookAt / emotion / lip-sync / blink / external sources
→ expression composer
→ constraints
→ semantic 52-parameter face weights
→ morph targets / bones
→ renderer
→ WebGL or WebGPU

The host owns requestAnimationFrame. Core remains deterministic and scheduler-independent.

## Animation

The animation package provides:

- validated keyframe clips;
- deterministic single-clip playback;
- state machines;
- triggers;
- numeric parameter conditions;
- enter/exit/transition callbacks;
- crossfade output;
- weighted multi-clip blending;
- runtime ExpressionSource adapters.

Three.js also supports native AnimationMixer/AnimationAction blending for GLB bone and morph animations; the engine keeps its semantic expression layer above that renderer-specific facility. Three.js documents crossfading, action weights and simultaneous animation control. 

## Character customization

CharacterCustomization defines explicit slots for body, head, hair, top, bottom, shoes, accessories and textures.

Each item can reference a validated HTTP(S) GLB, texture and semantic morph adjustments. Renderer ownership is explicit: replaced resources are disposed, and asynchronous loads are discarded safely if the scene is destroyed.

## Camera and LookAt

The renderer supports orthographic and perspective projection. Perspective state validates FOV, aspect ratio and clipping planes and updates the projection matrix.

LookAt computes constrained yaw/pitch, applies exponential damping, and emits dedicated head/eye quaternions. Three.js renderer traversal applies those poses to Head, Eye.L and Eye.R objects when available, while semantic eye weights remain available as a fallback.

## Asset lifecycle

Asset caches are bounded and support:

- async preload;
- concurrent-load deduplication;
- reference counting;
- invalidation;
- byte-budget eviction;
- deterministic disposal.

Renderer resources follow explicit instance ownership and rejected GLB loads are disposed.

## Shared renderer

SharedThreeRenderer uses one Three.js rendering context for multiple avatar scenes. Runtime render calls register active scenes; the host calls renderFrame once per frame.

This keeps the frame scheduler outside the engine and avoids rendering the same shared scene once per avatar.

## Quality and throttling

DynamicQualityController uses visibility plus exponentially smoothed frame rate to select:

- Low;
- Medium;
- High;
- Ultra.

The React adapter uses IntersectionObserver and skips update/render while invisible. Pixel ratio is adjusted only when the selected tier changes.

## Browser and performance gates

Playwright runs the real Studio bundle in Chromium with deterministic software rendering flags. The browser gate verifies the canvas, controls, screenshot capture and sustained frame-time behavior.

Hardware-specific GPU timing is not treated as deterministic CI evidence; deployment profiling remains necessary for physical GPU regression analysis.

## Studio

@toon2.5d/studio is a downstream React surface backed by the same runtime, expression system, animation package and renderer. It provides interactive facial controls and animation preview without creating a parallel engine.

## Security and TypeScript

Production code is strict TypeScript with no any, unknown or implicit any. External asset URLs are validated as HTTP(S). Renderer and asset failures are isolated from application state, resources are disposed deterministically, and no asset-provided code is executed.

## Definition of done

The current studio-grade engine is considered complete when:

- all packages build and typecheck;
- animation state machine and blending tests pass;
- customization/camera/LookAt/cache tests pass;
- renderer morph application tests pass;
- reference GLB generation and validation pass;
- browser Studio gate passes;
- documentation describes implemented behavior rather than future-only APIs.
