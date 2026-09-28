# Asset Production Pipeline

## Pipeline

Blender -> model/retopology/UV/materials/rig/morph targets/animation -> GLB -> validation -> optimization -> manifest -> CDN or application bundle.

## V0 model contract

The reference head defines:

- stable root;
- predictable face structure;
- declared semantic morph targets;
- Toon material slots;
- asset version.

Optional skeleton and camera framing metadata are future asset capabilities.

## Semantic names

Canonical conceptual nodes include:

AvatarRoot, Head, Face, Eye.L, Eye.R, Brow.L, Brow.R, Mouth, Hair.

The V0 reference asset exposes the complete 52-parameter facial vocabulary as shape keys. Production assets may use aliases declared by their manifest.

## Validation

Current automated pipeline:

1. Generate the deterministic reference GLB.
2. Validate the generated GLB and its 52 facial morph targets.
3. Run TypeScript build, typecheck and tests.

Future gates:

1. Structural validation.
2. Canonical visual renders.
3. Performance benchmarks.
4. Packaging and hashing.

## Compression

Use established glTF ecosystem tooling such as Meshopt/Draco for geometry and KTX2/BasisU for textures when benchmarks justify them.

## Asset variants

Where useful:

avatar-head.high.glb
avatar-head.medium.glb
avatar-head.low.glb

The runtime quality policy for selecting variants is future work.

## Separation

The engine package must not bundle a huge asset catalog. Runtime and asset packs remain independently versioned.
