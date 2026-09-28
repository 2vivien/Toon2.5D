# Facial Expression Research

Research date: 2026-09-28.

## ARKit 52 as the semantic vocabulary

Apple defines facial coefficients as normalized values from 0 to 1 and explicitly notes that applications can use a subset or the complete set depending on the desired visual effect.

Toon2.5D adopts the 52 names as a semantic vocabulary, not as a dependency on ARKit.

This gives the engine:

- a broad facial vocabulary;
- direct compatibility with many existing GLB avatar rigs;
- a stable target for future camera tracking adapters;
- a practical interchange language between authoring and runtime.

## VRM execution model

VRM 1.0 recommends resolving LookAt, then updating expressions from emotion/lip-sync/blink/look-at sources, applying expressions, resolving constraints, then resolving secondary motion.

Toon2.5D keeps the same architectural principle while using its own semantic composer and constraint layer.

## Avatar-stage

avatar-stage demonstrates practical ARKit preset handling, alias mapping, viseme lip-sync and modular runtime components.

Toon2.5D adopts the useful idea of alias mapping but moves it into versioned asset manifests so the engine does not need model-specific heuristics at runtime.

## CharacterStudio

CharacterStudio demonstrates separating asset packs from the application and moving character logic out of React.

Toon2.5D applies the same boundary to the future Studio product: the Studio consumes the exact same runtime and asset contracts.

## Three.js

Three.js exposes morph target dictionaries and influence arrays on meshes. GLTFLoader supports common glTF compression extensions including Draco, Meshopt and KTX2/BasisU.

Toon2.5D therefore keeps semantic facial logic in core and maps it to renderer-owned morph influences only at the final rendering boundary.

## Design conclusion

The engine should not copy any one project.

It combines:

1. VRM's explicit update ordering;
2. ARKit's detailed facial vocabulary;
3. avatar-stage's aliasing and modularity;
4. CharacterStudio's asset-pack separation;
5. Three.js's glTF and morph-target runtime;
6. a strict Toon2.5D semantic layer and performance contract.
