# Rendering Architecture

## Rendering philosophy

The engine is technically 3D and visually stylized/2.5D.

We want:

- real depth
- real perspective
- real occlusion
- real lighting
- real head rotation

while maintaining a clean cartoon visual language.

## Pipeline

```
Character state
   -> Scene graph
   -> Three.js objects
   -> Camera
   -> Materials
   -> Lights
   -> WebGL renderer
   -> Frame
```

## Camera

Support two camera modes:

1. Orthographic for a flatter social-avatar look.
2. Perspective for more pronounced depth.

The avatar-facing camera is the default abstraction. Applications should not need to manipulate Three.js cameras directly.

## Lighting

Initial setup:

- key light
- fill light
- rim light or controlled environment contribution

Lighting must be deterministic enough for visual tests.

## Materials

Prefer a small material vocabulary:

- skin
- hair
- eye
- cloth
- accessory
- transparent/detail

Avoid dozens of unique materials because material count affects rendering overhead.

## Depth

Depth comes from actual 3D geometry and hierarchy. Do not simulate all depth with arbitrary z-index values.

## Rendering modes

V0:
- WebGL through Three.js.

Future:
- WebGPU adapter.
- shared renderer for many avatars.
- instancing where asset topology permits.

## Resize

Renderer dimensions follow the host element. Device pixel ratio is capped by a configurable quality policy.

## Render loop

The render loop must be owned by the runtime, not React.

```
requestAnimationFrame
  -> compute dt
  -> update animation
  -> update look-at
  -> update transforms
  -> render
```

The loop must stop when disposed.
