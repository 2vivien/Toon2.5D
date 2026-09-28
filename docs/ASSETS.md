# Asset System

## Canonical asset format

GLB/glTF is the runtime format for 3D assets.

The asset pipeline may originate from Blender, but the runtime must never depend on Blender.

## Current V0 asset contract

V0 accepts a logical asset manifest containing:

- schema version;
- stable asset ID and version;
- HTTP(S) GLB URI;
- GLB MIME type;
- expression profile;
- semantic morph bindings;
- at least one anchor.

Manifest validation currently covers these metadata and expression-contract rules.

## Asset categories

- base head
- eyes
- brows
- nose
- mouth
- hair
- facial hair
- accessories
- materials/textures
- animation clips

These categories are part of the target asset model; V0 primarily consumes a complete GLB head asset.

## Registry

The current AssetRegistry provides:

- register(manifest);
- get(id);
- resolve(id);
- clear().

It is a manifest registry and resolver, not yet a complete asynchronous cache or persistent asset lifecycle manager.

## Loading states

The target lifecycle is:

```
unrequested
  -> loading
  -> loaded
  -> cached
  -> disposed
```

V0 runtime loading is exposed through `runtime.load()`. Cache, retry policy and persistent storage are future asset-system layers.

## Validation

Validate before GPU creation where possible:

- schema;
- asset identity;
- supported type;
- URL scheme;
- expression profile;
- morph aliases;
- anchors.

Future validation layers include binary GLB inspection, integrity verification, engine compatibility, resource limits and structural safety checks.

## Sharing

Shared immutable assets can be reused between avatars. Per-instance mutable state must never be stored in shared asset objects.

## Compression

Meshopt decoding is enabled by default in the Three.js loader. Draco and KTX2/BasisU require explicit decoder/transcoder configuration and renderer support.

Profile before choosing compression. Compression is useful only when transfer, memory and decode costs are justified by benchmarks.

## CDN

Production applications should be able to configure an asset base URL without changing character definitions.

## Security

Never execute downloaded assets as code. Treat remote asset metadata as untrusted input. Host applications should enforce allowed origins and resource limits.

Runtime binary resource limits and full integrity verification remain future hardening layers.
