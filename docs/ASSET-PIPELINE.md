# Asset Production Pipeline

## Pipeline

Blender -> model/retopology/UV/materials/rig/morph targets/animation -> GLB -> validation -> optimization -> manifest -> CDN or application bundle.

## V0 model contract

Every head asset defines:
- stable root;
- predictable face anchors;
- optional skeleton;
- declared morph target names;
- Toon material slots;
- camera framing metadata;
- asset version.

## Semantic names

Nodes:
AvatarRoot, Head, Face, Eye.L, Eye.R, Brow.L, Brow.R, Mouth, Hair.

Morph targets:
mouthSmile, mouthOpen, eyeBlink.L, eyeBlink.R, browRaise.L, browRaise.R, cheekRaise.

Names are part of the asset contract.

## Validation

1. Schema validation.
2. Structural validation.
3. Canonical visual renders.
4. Performance benchmarks.
5. Packaging and hashing.

## Compression

Use established glTF ecosystem tooling such as Meshopt/Draco for geometry and KTX2/BasisU for textures when benchmarks justify them.

## Asset variants

Where useful:
avatar-head.high.glb
avatar-head.medium.glb
avatar-head.low.glb

The runtime chooses a variant through a quality policy.

## Separation

The engine package must not bundle a huge asset catalog. Runtime and asset packs remain independently versioned.
