# Rendering Architecture

## Rendering philosophy

The engine is technically 3D and visually stylized/2.5D.

We want real depth, real perspective where supported, real occlusion, real lighting and real head rotation while maintaining a clean cartoon visual language.

## Current V0 pipeline

```
Semantic face state
   -> Renderer scene
   -> Three.js objects
   -> Orthographic camera
   -> Materials
   -> Lights
   -> WebGL renderer
   -> Frame
```

## Camera

V0 implements an orthographic camera only.

Perspective camera support is a future renderer capability. Applications should not manipulate Three.js cameras directly.

## Lighting

The current renderer uses a hemisphere light and a directional key light. Dedicated fill/rim lighting controls remain future capabilities.

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
- WebGPU adapter;
- shared renderer for many avatars;
- instancing where asset topology permits.

## Resize

The renderer exposes explicit resize(width, height). The runtime forwards validated dimensions to the renderer.

## Render loop

The render loop is owned by the host runtime adapter, not React state.

```
requestAnimationFrame
  -> compute dt
  -> update
  -> render
```

The loop must stop when the adapter is disposed.

## Look-at

The current renderer maps semantic eye look parameters to a limited root rotation approximation. A dedicated head-pose and humanoid look-at system is future work.
