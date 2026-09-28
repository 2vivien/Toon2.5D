# Asset System

## Canonical asset format

GLB/glTF is the runtime format for 3D assets.

The asset pipeline may originate from Blender, but the runtime must never depend on Blender.

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

## Manifest

Every production asset pack has a manifest:

```json
{
  "version": 1,
  "id": "toon-default",
  "assets": {
    "head.base": {
      "type": "model",
      "path": "head/base.glb"
    }
  }
}
```

## Validation

Validate before GPU creation:

- schema
- asset ID format
- supported type
- expected file metadata
- compatible engine version
- optional integrity metadata

## Loading states

```
unrequested
  -> loading
  -> loaded
  -> cached
  -> disposed
```

Failure is terminal for that load attempt but may be retried according to policy.

## Caching

Use layered caching:

1. in-memory asset registry
2. browser/network cache
3. optional persistent cache in future versions

Cache keys must include asset version.

## Sharing

Shared immutable assets can be reused between avatars. Per-instance mutable state must never be stored in the shared asset object.

## Compression

Profile before choosing compression. Meshopt/Draco and KTX2 can reduce transfer/memory cost but add decode complexity. The pipeline must document supported browser fallbacks.

## CDN

Production applications should be able to configure an asset base URL without changing character definitions.

## Security

Never execute downloaded assets as code. Treat remote asset metadata as untrusted input. Enforce allowed origins and size limits in host applications.
