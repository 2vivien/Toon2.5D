# Toon2.5D — Technical Blueprint V0.1

Status: living blueprint
Target: engine-first, head-first, production-grade foundation
Implementation rule: the blueprint defines the intended architecture, while every implemented capability must be verified against the code and tests.

## 1. Non-negotiable goals

Toon2.5D is a real-time 3D avatar runtime with a controlled 2.5D visual language.

V0.1 architecture requires:

- deterministic runtime lifecycle;
- framework-independent core;
- Three.js renderer adapter;
- versioned GLB/glTF asset contracts;
- modular facial-expression pipeline;
- explicit update ordering;
- typed validation and errors;
- deterministic tests;
- measurable performance budgets;
- a small public API.

A requirement in this blueprint is not considered implemented until executable code and tests provide evidence.

## 2. V0.1 explicit limits

The V0.1 release is intentionally bounded by these ten rules:

1. V0.1 uses deterministic single-clip animation only.
2. V0.1 has no animation state machine.
3. V0.1 has no crossfade or multi-clip blending.
4. V0.1 uses an orthographic camera only.
5. V0.1 does not implement dedicated head/eye bone LookAt; LookAt remains semantic with the documented renderer approximation.
6. V0.1 does not own requestAnimationFrame in core; the host scheduler owns the frame loop.
7. V0.1 does not implement full character customization; the current runtime targets the reference head and manifest-driven facial morph bindings.
8. V0.1 does not implement a complete asset cache or a shared renderer/context for multiple avatar instances.
9. V0.1 does not implement automatic throttling or automated rendering quality tiers.
10. V0.1 does not include browser visual/GPU performance release gates or the Studio UI.

## 2. Product boundaries

ENGINE
- avatar definition contracts;
- expression system;
- runtime lifecycle;
- renderer contract;
- semantic facial state.

ANIMATION
- deterministic keyframe playback;
- interpolation;
- conversion to core expression sources.

ASSETS
- manifests;
- GLB/glTF;
- validation;
- compression support;
- registry/resolution.

STUDIO
- future editor;
- same runtime;
- same asset contracts;
- same expression engine;
- no second rendering implementation.

The Studio must never invent a parallel avatar runtime.

## 3. Package graph

```
core
  ^
  |
  +-- assets
  +-- animation
  +-- renderer-three
          ^
          |
          +-- react
```

Core never imports React, DOM, Three.js or the animation package.

The animation package depends on core because it produces the core ExpressionSource contract. Runtime applications attach animation sources explicitly.

## 4. Current runtime phases

The host scheduler drives each frame:

```
Input Collection
      ↓
Source Evaluation
      ↓
Expression Composition
      ↓
Facial Constraints
      ↓
Semantic Face Weights
      ↓
Renderer Application
      ↓
Render
```

The core runtime exposes deterministic `update(deltaSeconds)` and `render()`; it does not own requestAnimationFrame.

## 5. Facial pipeline

```
Expression Sources
 ├── Emotion
 ├── Blink
 ├── LookAt
 ├── LipSync
 ├── Animation
 └── External Override
          ↓
   Expression Controller
          ↓
      Composer
          ↓
      Constraints
          ↓
   Semantic Face Weights
          ↓
       Renderer
```

The controller never writes directly to Three.js morphTargetInfluences.

It produces renderer-independent semantic output.

## 6. Canonical semantic face parameters

V0.1 defines exactly 52 normalized facial parameters.

The TypeScript `FaceParameter` union and automated face-contract tests are the authoritative contract. The vocabulary follows the ARKit-compatible semantic naming convention without requiring ARKit at runtime.

The asset layer maps these semantic parameters to actual morph targets through versioned bindings.

## 7. Emotion model

Emotion is intent, not geometry.

Current V0 supports:

- eight named emotions;
- normalized intensity;
- deterministic transition smoothing;
- semantic parameter presets.

Current emotion presets do not expose configurable per-emotion attack/release durations or channel override policies.

Emotion contributions are additive and are composed with independent blink, lip-sync, look-at and custom sources.

## 8. Source layers

Current evaluation order:

1. LookAt
2. Emotion
3. LipSync
4. Blink
5. Animation/custom sources
6. External overrides
7. Composition
8. Constraints

Each contribution has:

- source id;
- parameter;
- value;
- weight;
- priority;
- blend mode.

Supported blend modes are ADD, OVERRIDE, MULTIPLY, MAX and MIN.

No implicit last-write-wins rule is used.

## 9. Composition rules

All semantic values are clamped to [0, 1].

The compositor is deterministic: identical inputs and time produce identical logical output.

Priority is explicit. External face overrides use the highest current priority so an application can intentionally control selected parameters without mutating renderer state.

## 10. Override policy

Overrides are explicit and scoped.

Current V0 guarantees:

- look-at only contributes eye-gaze parameters;
- external overrides are represented as expression contributions;
- facial constraints run after composition;
- direct face overrides survive subsequent runtime update calls.

More specialized channel override policies remain future work.

## 11. Look-at

Current V0 uses semantic eye-gaze parameters with:

- horizontal and vertical limits;
- smoothing;
- deterministic evaluation.

The current Three.js renderer also applies a limited root-rotation approximation.

Future work includes dedicated eye/head bones, avatar-local target transforms, dead zones and a full humanoid look-at solver.

## 12. Blink

Blink is an independent deterministic source.

Current V0 supports:

- automatic blink;
- seeded pseudo-random intervals;
- configurable close, hold and open durations;
- deterministic testable timing.

Manual blink, asymmetric blink and advanced interruption policies remain future work.

## 13. Lip sync

Lip sync is an adapter from viseme state to semantic mouth parameters.

V0 supports:

- silence;
- AA;
- EE;
- IH;
- OH;
- OU.

The source can coexist with emotion because both produce independent semantic contributions.

External audio/phoneme provider adapters remain future work.

## 14. Constraints

Constraints run after expression composition and before renderer application.

Current constraints include:

- mouth smile reduction from jaw opening;
- smile/frown conflict handling;
- mouth-close reduction from jaw opening;
- eye squint/wide interaction with blink;
- normalized tongue bounds.

Future asset-defined deformation limits and symmetric modes remain planned.

## 15. Renderer contract

The core renderer contract currently exposes:

- create scene;
- load asset;
- set avatar transform;
- set semantic face weights;
- render;
- resize;
- dispose.

Three.js types remain inside renderer-three.

Node attachment, material-state updates and a richer scene graph API are future capabilities.

## 16. Scene representation

The conceptual avatar structure is:

```
AvatarRoot
 └── Head
     ├── Face
     ├── Eye.L
     ├── Eye.R
     ├── Brow.L
     ├── Brow.R
     ├── Mouth
     ├── Hair
     └── Accessories
```

The current core does not expose this as a Three.js scene graph. Renderer-three owns the concrete render scene.

## 17. Asset pipeline

```
Blender
 ↓
Modeling
 ↓
Retopology / UV / Materials
 ↓
Bones / Morphs
 ↓
GLB
 ↓
Validation
 ↓
Optimization
 ↓
Manifest
 ↓
CDN or application bundle
```

The reference pipeline deterministically generates and validates the 52-morph reference head.

## 18. Asset manifest

Current production manifest fields are:

- schemaVersion;
- id;
- version;
- URI;
- GLB MIME type;
- optional integrity metadata;
- expression profile;
- semantic morph bindings;
- anchors.

Binary inspection, engine compatibility, resource limits, licensing metadata and complete integrity verification remain future validation layers.

## 19. Resource ownership

Resources are classified conceptually as:

SHARED
- immutable geometry;
- textures;
- decoded asset data.

INSTANCE
- transforms;
- expression state;
- animation state;
- controller state.

Renderer disposal is explicit. Rejected or replaced GLB scenes are disposed before being discarded.

## 20. Security rules

- validate external asset references;
- allow only HTTP(S) asset URLs in V0;
- never execute asset-provided code;
- never evaluate arbitrary expressions as code;
- bound asset dimensions and payload sizes at host/pipeline boundaries;
- protect caches against unbounded growth;
- isolate renderer failures from application state;
- never log secrets or signed URLs;
- keep telemetry/network policy outside core.

Some resource limits and full binary integrity checks are future hardening layers.

## 21. Performance budgets

Initial targets are budgets, not promises:

- minimal frame-loop allocations;
- no React state update per frame;
- no asset parsing inside render;
- no DOM query inside frame loop;
- deterministic disposal;
- target 60 FPS for the reference head on a representative desktop;
- track load time, decoded asset size, JS heap and GPU resources.

Current V0 already reuses core expression buffers and animation output buffers.

Every optimization must have benchmark or profiling evidence.

## 22. Testing layers

UNIT
- math;
- interpolation;
- composition;
- constraints;
- facial sources;
- schema validation.

INTEGRATION
- asset loading;
- runtime lifecycle;
- runtime animation attachment;
- resize;
- explicit overrides;
- disposal.

ASSET
- deterministic reference GLB generation;
- 52-morph validation.

VISUAL / BROWSER
- planned for neutral, emotions, blink, look-at, mouth shapes and mixed sources.

PERFORMANCE
- benchmark scaffold exists;
- browser/GPU regression gates remain required before stable release.

## 23. Code-size policy

Production source rules:

- maximum 150 lines per source file;
- maximum 50 lines per React component;
- maximum 50 lines per public method;
- one responsibility per module;
- no circular dependency;
- no `any`;
- no `unknown`;
- no implicit `any`;
- strict TypeScript;
- explicit return types on public APIs;
- no hidden mutable singleton state.

If a file exceeds the limit, split by responsibility rather than compressing formatting.

## 24. API design

Current public runtime API exposes intent without exposing renderer internals:

```
runtime.load(asset)
runtime.update(delta)
runtime.render()
runtime.resize(width, height)
runtime.expression.setEmotion(...)
runtime.expression.setLipSync(...)
runtime.setLookAt(...)
runtime.setFaceWeights(...)
runtime.pause()
runtime.resume()
runtime.destroy()
```

Animation attaches through `attachAnimation(runtime, player)`.

Richer character, animation-controller, event and React prop facades are future API layers.

## 25. Definition of done for V0.1

V0.1 is complete only when:

- all packages build independently;
- public types compile with strict mode;
- no forbidden types exist;
- reference head asset validates;
- expression pipeline is deterministic;
- emotion, blink, look-at and lip-sync sources compose;
- animation can attach to the runtime through the package adapter;
- constraints execute after composition;
- renderer receives semantic output only;
- disposal tests pass;
- browser smoke test passes;
- reference benchmark is recorded;
- documentation matches implementation.

Until the browser and performance gates are satisfied, the release remains pre-stable.
