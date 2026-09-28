# Toon2.5D Asset Pipeline

The runtime consumes validated GLB assets. The reference head is reproducible from Blender instead of committing an opaque binary source asset.

## Reference head

Use Blender in background mode:

    blender --background --python tools/build_reference_head.py

Run the command from this directory or adjust the script path. The exporter writes:

    generated/head.reference.glb

The reference model contains the 52 ARKit-compatible facial shape-key names used by the Toon2.5D semantic layer.

## Production pipeline

1. Model and retopologize in Blender.
2. Keep stable semantic anchors.
3. Author facial shape keys.
4. Export GLB.
5. Validate anchors, morph names, materials and animation.
6. Compress geometry with Meshopt or Draco when measurements justify it.
7. Compress textures with KTX2/BasisU when textures are present.
8. Generate a versioned asset manifest.
9. Publish the asset pack to a controlled CDN.

Blender's glTF exporter supports shape-key export and Meshopt/Draco compression options. The exporter must not apply destructive transforms that prevent shape-key export.
