# Architecture

## 1. System shape

```
Application
  |
  +-- @toon2.5d/react
  |       |
  |       +-- Runtime adapter
  |
  +-- @toon2.5d/core
          |
          +-- Character Model
          +-- Scene Graph
          +-- Expression Controller
          +-- Animation Controller
          +-- Camera State
          +-- Asset Contracts
          +-- Events
          |
          +-- Renderer Contract
                    |
                    +-- @toon2.5d/renderer-three
                              |
                              +-- Three.js
                                      |
                                      +-- WebGL
```

## 2. Layer boundaries

### Core
Owns domain state and deterministic logic. It must not import React, DOM APIs or Three.js.

### Renderer
Owns conversion from engine scene state to GPU representation.

### Asset layer
Owns manifests, loading, validation, caching and lifecycle.

### Animation
Owns timelines, keyframes, blending and state transitions.

### Framework adapters
Translate framework lifecycle into engine lifecycle. They must not contain avatar business logic.

## 3. Runtime lifecycle

1. Create runtime.
2. Validate configuration.
3. Initialize renderer.
4. Resolve/load assets.
5. Build avatar scene.
6. Attach controllers.
7. Start update loop.
8. Render.
9. Pause when hidden when policy allows.
10. Dispose deterministically.

## 4. Ownership

Every GPU resource must have an owner and a release path. Shared resources use reference counting or an explicit asset registry. An avatar instance must never blindly dispose globally shared resources.

## 5. Scene graph

The scene graph is hierarchical:

```
AvatarRoot
  ├── Head
  │   ├── Face
  │   ├── Eyes
  │   ├── Brows
  │   ├── Nose
  │   ├── Mouth
  │   └── Hair
  └── Accessories
```

Transforms are local where possible. World transforms are derived.

## 6. Data flow

```
CharacterDefinition
       |
       v
Validator
       |
       v
CharacterRuntime
       |
       +--> ExpressionController
       +--> AnimationController
       +--> LookAtController
       |
       v
Scene Graph
       |
       v
Renderer
       |
       v
GPU
```

## 7. Threading

V0 uses the main thread for simplicity. The architecture must keep asset decoding, serialization and future worker work isolated from the core API so OffscreenCanvas/worker rendering can be introduced later without changing character definitions.

## 8. Error policy

- Invalid user configuration: typed validation error.
- Missing optional asset: fallback where defined.
- Missing required asset: fail avatar creation with actionable diagnostics.
- Renderer failure: expose a typed renderer error.
- Runtime disposal is idempotent.
