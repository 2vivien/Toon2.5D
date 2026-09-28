# Toon2.5D — Technical Blueprint V0.1

Status: proposed
Target: engine-first, head-first, production-grade foundation
Implementation rule: blueprint before feature code

## 1. Non-negotiable goals

Toon2.5D is a real-time 3D avatar runtime with a controlled 2.5D visual language.

V0.1 must provide:

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

The facial system is a first-class subsystem, not a collection of UI sliders.

## 2. Product boundaries

ENGINE
- character state;
- scene graph;
- expressions;
- animation;
- look-at;
- constraints;
- runtime lifecycle.

ASSETS
- manifests;
- GLB/glTF;
- validation;
- compression variants;
- cache;
- ownership;
- asset packs.

STUDIO
- future editor;
- same runtime;
- same asset contracts;
- same expression engine;
- no second rendering implementation.

The Studio must never invent a parallel avatar runtime.

## 3. Package graph

```
core/
  ├── @toon2.5d/core
  ├── domain types
  ├── scene graph contracts
  ├── expression contracts
  ├── runtime lifecycle
  └── renderer contract

assets/
  ├── @toon2.5d/assets
  ├── manifests
  ├── validation
  ├── resolution
  └── cache contracts

animation/
  ├── @toon2.5d/animation
  ├── timeline
  ├── interpolation
  ├── state machine
  └── blending

renderer-three/
  └── @toon2.5d/renderer-three

react/
  └── @toon2.5d/react
```

Dependency rule:

core <- assets
core <- animation
core <- renderer-three
core + renderer-three <- react

Core never imports React, DOM, Three.js or browser globals.

## 4. Runtime phases

Every frame follows a fixed pipeline:

```
Input Collection
      ↓
Source Evaluation
      ↓
Expression Composition
      ↓
Morph/Material Targets
      ↓
Constraints
      ↓
Pose / Secondary Motion
      ↓
Scene Synchronization
      ↓
Render
```

No subsystem may silently reorder another subsystem.

## 5. Facial pipeline

```
Expression Sources
 ├── Emotion
 ├── Blink
 ├── LookAt
 ├── LipSync
 ├── Animation
 └── External Input
          ↓
   Expression Controller
          ↓
   Semantic Parameters
          ↓
      Composer
          ↓
    Morph Weights
          ↓
      Constraints
          ↓
       Rendering
```

The controller is not allowed to write directly to Three.js morphTargetInfluences.

It produces renderer-independent semantic output.

## 6. Canonical semantic face parameters

V0.1 uses normalized values in [0, 1] unless a contract explicitly states another range.

Core parameters:

- mouthSmile
- mouthOpen
- mouthFrown
- mouthPucker
- mouthStretch
- jawOpen
- eyeBlinkLeft
- eyeBlinkRight
- eyeSquintLeft
- eyeSquintRight
- browRaiseLeft
- browRaiseRight
- browFurrowLeft
- browFurrowRight
- cheekRaiseLeft
- cheekRaiseRight
- cheekPuff
- noseWrinkle
- eyeLookHorizontal
- eyeLookVertical

The asset layer maps semantic parameters to actual morph targets, bones or material controls.

## 7. Emotion model

Emotion is intent, not geometry.

An emotion preset contains:

- semantic parameter targets;
- optional intensity;
- attack duration;
- release duration;
- priority;
- optional channel overrides.

Example:

```
happy
  mouthSmile: 0.82
  cheekRaise: 0.55
  eyeSquint: 0.18
```

Emotion presets are composable. A later emotion must not erase independent systems such as blinking or lip sync unless an explicit override policy says so.

## 8. Source layers

Sources are evaluated independently.

Recommended logical layers:

1. Base
2. Emotion
3. Animation
4. LipSync
5. Blink
6. LookAt
7. External override

Each contribution has:

- source id;
- parameter;
- value;
- weight;
- priority;
- blend mode;
- optional mask.

No implicit last-write-wins.

## 9. Composition rules

Default blend modes:

ADD
- adds a bounded contribution.

OVERRIDE
- replaces lower-priority contributions.

MULTIPLY
- scales an existing contribution.

MAX
- keeps the strongest contribution.

MIN
- keeps the smallest contribution.

All final values are clamped to the parameter contract.

The compositor is deterministic: identical inputs and time must produce identical output.

## 10. Override policy

Overrides are explicit and scoped.

Examples:

- strong blink may temporarily suppress eye-squint;
- mouth override may suppress lip-sync;
- look-at must not overwrite mouth parameters;
- emotion must not directly own eye rotation when the look-at controller owns gaze;
- external input may override a named parameter only when requested.

No global emergency override exists.

## 11. Look-at

Look-at has two possible outputs:

- eye bone rotation;
- semantic expression values.

The target is transformed into avatar-local space.

Horizontal and vertical values are clamped by avatar profile limits.

The system must support dead zones and smoothing.

Look-at does not directly mutate render objects.

## 12. Blink

Blink is an independent source.

It supports:

- automatic blink;
- manual blink;
- asymmetric blink;
- blink duration;
- closing/opening curves;
- interruption policy.

Blink timing must use injected time so tests remain deterministic.

A blink controller owns eye closure only. It does not own the entire expression state.

## 13. Lip sync

Lip sync is an adapter from audio/phoneme input to semantic mouth parameters.

V0.1 must support a provider contract, not a single audio algorithm.

Possible future providers:

- phoneme events;
- visemes;
- amplitude;
- external speech engines.

Lip sync must be able to coexist with emotion.

Example:
happy + vowel "A" produces a smile plus mouthOpen rather than replacing the smile.

## 14. Constraints

Constraints run after expression application.

Examples:

- mouthOpen limits mouthSmile;
- eyeBlink limits eyeSquint;
- jawOpen limits incompatible mouth shapes;
- symmetric mode can mirror selected parameters;
- asset-defined maximum deformation prevents invalid face shapes.

Constraints are pure functions where possible.

## 15. Renderer contract

Core renderer contract exposes only operations required by the runtime:

- create scene;
- attach node;
- update transform;
- update semantic face target;
- update material state;
- render;
- resize;
- dispose.

Three.js types remain inside renderer-three.

## 16. Scene graph

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

Semantic anchors are stable asset contracts.

## 17. Asset pipeline

```
Blender
 ↓
Modeling
 ↓
Retopology
 ↓
UV
 ↓
Materials
 ↓
Bones / Morphs
 ↓
GLB
 ↓
Validation
 ├── Geometry
 ├── Textures
 └── Animation
 ↓
Optimization
 ├── Meshopt / Draco
 ├── KTX2 / BasisU
 └── animation optimization
 ↓
Asset Pack
 ↓
CDN
```

The runtime never receives an unvalidated production asset.

## 18. Asset manifest

Every production asset declares:

- id;
- schemaVersion;
- assetVersion;
- url or resolver key;
- required anchors;
- morph names;
- material slots;
- compression capabilities;
- compatibility;
- license metadata;
- integrity metadata where distribution requires it.

## 19. Resource ownership

Resources are classified:

SHARED
- immutable geometry;
- textures;
- decoded asset data;
- material templates where safe.

INSTANCE
- transforms;
- expression state;
- animation state;
- controller state.

The instance must never dispose a resource owned by the shared registry.

## 20. Security rules

- validate every external asset reference;
- allow only configured protocols;
- reject unexpected MIME/content types;
- never execute asset-provided code;
- never evaluate arbitrary expressions as code;
- bound asset dimensions and payload sizes;
- protect caches against unbounded growth;
- isolate renderer failures from application state;
- never log secrets or signed URLs;
- keep network access outside core.

## 21. Performance budgets

Initial targets are budgets, not promises:

- no per-frame object allocation in hot paths;
- no React state update per frame;
- no asset parsing inside render;
- no DOM query inside frame loop;
- deterministic disposal;
- target 60 FPS for the reference head on a representative desktop;
- track load time, decoded asset size, JS heap and GPU resources.

Every optimization must have a benchmark.

## 22. Testing layers

UNIT
- math;
- interpolation;
- composition;
- constraints;
- state machines;
- schema validation.

INTEGRATION
- asset loading;
- runtime lifecycle;
- renderer synchronization;
- disposal.

VISUAL
- neutral;
- happy;
- sad;
- angry;
- surprised;
- blink;
- look left/right/up/down;
- mouth shapes;
- mixed emotion + lip sync;
- mixed emotion + blink.

PERFORMANCE
- one avatar;
- many avatars sharing assets;
- cold load;
- warm cache.

## 23. Code-size policy

Production source rules:

- maximum 150 lines per source file;
- maximum 50 lines per React component;
- maximum 50 lines per public method;
- one responsibility per module;
- no god classes;
- no circular dependency;
- no `any`;
- no `unknown`;
- no implicit `any`;
- no unchecked type assertions;
- strict TypeScript;
- explicit return types on public APIs;
- exhaustive discriminated unions;
- errors represented by typed error classes/results;
- no hidden mutable singleton state.

If a file exceeds the limit, split by responsibility rather than compressing formatting.

## 24. API design

Public API should expose intent:

```
avatar.expression.set("happy")
avatar.expression.setIntensity(0.8)
avatar.lookAt.setTarget(target)
avatar.animation.play("idle")
avatar.update(delta)
avatar.render()
avatar.destroy()
```

The application should never need to know how morph targets, bones or Three.js objects are implemented.

## 25. Definition of done for V0.1

V0.1 is complete only when:

- all packages build independently;
- public types compile with strict mode;
- no forbidden types exist;
- reference head asset validates;
- expression pipeline is deterministic;
- emotion, blink, look-at and lip-sync sources compose;
- constraints execute after composition;
- renderer receives semantic output only;
- disposal tests pass;
- browser smoke test passes;
- reference benchmark is recorded;
- documentation matches implementation.
