# Asset Production Pipeline

## Pipeline

Blender -> model/retopology/UV/materials/rig/morph targets/animation -> GLB -> validation -> optimization -> manifest -> CDN or application bundle.

## V1 reference asset contract

The reference head defines:

- stable root;
- predictable face structure;
- declared semantic morph targets;
- Toon material slots;
- asset version.

Skeleton rig metadata and camera state are explicit runtime capabilities; manifests declare head and eye bone mappings.

## Semantic names

Canonical conceptual nodes include:

AvatarRoot, Head, Face, Eye.L, Eye.R, Brow.L, Brow.R, Mouth, Hair.

The V1 reference asset exposes the complete 52-parameter facial vocabulary as shape keys. Production assets may use aliases declared by their manifest.

## Validation

Current automated pipeline:

1. Generate the deterministic reference GLB.
2. Validate the generated GLB and its 52 facial morph targets.
3. Run TypeScript build, typecheck and tests.

Additional production gates are executable through CI:

1. Structural validation.
2. Canonical visual renders.
3. Performance benchmarks.
4. Packaging, integrity hashing and trusted-origin policy.

## Compression

Use established glTF ecosystem tooling such as Meshopt/Draco for geometry and KTX2/BasisU for textures when benchmarks justify them.

## Asset variants

Where useful:

avatar-head.high.glb
avatar-head.medium.glb
avatar-head.low.glb

The runtime quality controller can select quality tiers; application asset registries may map those tiers to variant manifests.

## Separation

The engine package does not bundle a large asset catalog; manifests and versioned asset packs remain independently deployable. Runtime and asset packs remain independently versioned.
