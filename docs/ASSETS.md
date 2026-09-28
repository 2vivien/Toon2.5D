# Assets

GLB/glTF is the canonical runtime format.

## Runtime asset contract

A runtime asset contains a URI and semantic morph bindings. Manifest validation restricts external model references to HTTP(S).

## Asset lifecycle

The asset system provides registry/resolution plus a bounded cache with preload, reference counting, byte-budget eviction and invalidation.

The renderer separately owns decoded GPU resources and disposes them when a scene is replaced or destroyed.

## Customization

CharacterCustomization can swap GLB meshes and textures into explicit slots and can persist semantic morph adjustments.

## Pipeline

Blender → modeling/rigging/morphs → GLB → validation → optimization → manifest → runtime.
