# Architecture

## 1. System shape

```
Application
  |
  +-- @toon2.5d/react
  |       |
  |       +-- Runtime adapter + frame scheduler
  |
  +-- @toon2.5d/core
          |
          +-- Avatar Definition
          +-- Expression Controller
          +-- Runtime Lifecycle
          +-- Asset Contracts
          +-- Renderer Contract
          |
          +-- @toon2.5d/animation
          |       |
          |       +-- AnimationPlayer
          |       +-- ExpressionSource adapter
          |
          +-- @toon2.5d/renderer-three
                  |
                  +-- Three.js
                          |
                          +-- WebGL
```

The animation package depends on core; core never depends on animation. This preserves an acyclic dependency graph and keeps the engine framework-agnostic.

## 2. Layer boundaries

### Core
Owns domain state, deterministic expression logic, runtime lifecycle and renderer-independent contracts. It must not import React, DOM APIs or Three.js.

### Renderer
Owns conversion from runtime state to GPU representation.

### Asset layer
Owns manifests, validation, logical asset resolution and future cache/lifecycle services. The current registry is a manifest registry and resolver, not yet a complete asynchronous cache.

### Animation
Owns deterministic keyframe playback and converts animation output into the core ExpressionSource contract. Runtime integration is performed by the host application.

### Framework adapters
Translate framework lifecycle into engine lifecycle. They must not contain avatar business logic.

## 3. Runtime lifecycle

1. Create runtime.
2. Validate definition.
3. Create renderer scene.
4. Attach expression sources.
5. Load an optional runtime asset.
6. Update through explicit delta time.
7. Render.
8. Pause/resume explicitly.
9. Dispose deterministically.

The core runtime does not own requestAnimationFrame. Host applications and framework adapters own scheduling.

## 4. Ownership

Every GPU resource must have an owner and a release path. Shared resources use explicit ownership rules or an asset registry. An avatar instance must never blindly dispose globally shared resources.

## 5. Scene representation

The current V0 scene is renderer-owned. The core package exposes renderer contracts rather than a Three.js scene graph. The documented AvatarRoot hierarchy is the canonical conceptual structure for future richer character composition.

## 6. Data flow

```
AvatarDefinition
       |
       v
Validator
       |
       v
Runtime
       |
       +--> ExpressionController
       |       +--> Emotion
       |       +--> LipSync
       |       +--> Blink
       |       +--> LookAt
       |       +--> External / custom sources
       |
       v
Semantic Face Weights
       |
       v
Renderer
       |
       v
GPU
```

Animation enters through the same ExpressionSource boundary and does not require Three.js types in core.

## 7. Threading

V0 uses the main thread. Asset decoding, serialization and future worker work must remain isolated from core contracts so OffscreenCanvas/worker rendering can be introduced later without changing avatar definitions.

## 8. Error policy

- Invalid user configuration: typed validation error.
- Asset load failure: typed runtime error while preserving a usable fallback scene where supported.
- Renderer failure: renderer-owned failure surfaced through the runtime boundary.
- Runtime disposal is idempotent.
