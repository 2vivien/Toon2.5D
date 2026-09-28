# Rendering

## Cameras

ThreeRenderer supports both orthographic and perspective cameras. Perspective state validates FOV, aspect and clipping planes and updates the projection matrix.

## LookAt

LookAt computes constrained yaw/pitch with exponential damping. The renderer applies dedicated Head, Eye.L and Eye.R quaternions when those nodes exist and retains semantic eye-gaze weights as a fallback.

## Morph targets

Semantic face parameters are mapped to GLB morph targets through manifest bindings. Missing required bindings reject the asset before attachment.

## Lifecycle

Every renderer scene owns its instance resources. Replaced or rejected GLB scenes, customization meshes, textures and materials are disposed. Destroying a renderer disposes all remaining scenes and the renderer context.

## Shared renderer

SharedThreeRenderer uses one Three.js context for multiple scenes. Runtime render calls register scenes; the host calls renderFrame once per frame.

## WebGPU

WebGPURenderer is available as an independent adapter. Three.js documents WebGPU as a universal renderer with WebGL2 fallback when supported.
