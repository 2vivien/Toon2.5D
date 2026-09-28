# Avatar Model

## Objective

Represent an avatar as a stable, serializable definition rather than a framework component.

## Canonical shape

```ts
type AvatarDefinition = {
  version: 1;
  model: string;
  face: FaceConfig;
  skin: SkinConfig;
  eyes: EyesConfig;
  brows: BrowsConfig;
  nose: NoseConfig;
  mouth: MouthConfig;
  hair: HairConfig;
  accessories: AccessoryConfig[];
  colors: ColorPalette;
  expression?: string;
};
```

The exact TypeScript contracts belong in `packages/core` and this document defines their semantics.

## IDs

Asset IDs are stable logical IDs, not URLs.

Bad:
```ts
hair: "https://cdn.example.com/file123.glb"
```

Good:
```ts
hair: "hair.curly.003"
```

URL resolution belongs to the asset registry.

## Character composition

A character definition is resolved into a runtime graph:

```
Definition
  -> Resolver
  -> Asset references
  -> Node hierarchy
  -> Material parameters
  -> Morph/bone bindings
```

## Customization

Customization must be data-driven. Adding a hairstyle should not require changing the renderer.

## Determinism

Given the same definition, asset manifest version and engine version, the runtime should produce the same logical avatar state. Floating-point GPU pixels are not required to be bit-identical across devices.

## Versioning

Definitions carry a schema version. Migrations must be explicit:

```
v1 -> migrate -> v2
```

Never silently reinterpret old definitions.

## Future full-body extension

The model must reserve room for:

- torso
- clothing
- hands
- legs
- footwear
- body proportions

but V0 only implements the head/avatar target.
