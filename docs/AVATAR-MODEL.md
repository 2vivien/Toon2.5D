# Avatar Model

## Objective

Represent an avatar as a stable, serializable definition rather than a framework component.

## Current V0 shape

The current runtime definition is intentionally minimal:

```ts
type AvatarDefinition = {
  schemaVersion: 1;
  assetId: string;
  expressionProfileId: string;
};
```

It identifies the logical asset and semantic facial profile used by the runtime.

## Target compositional model

A future character definition may expand into:

```ts
type CharacterDefinition = {
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

This richer model is an architectural target, not the current V0 runtime contract.

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

The target composition pipeline is:

```
Definition
  -> Resolver
  -> Asset references
  -> Node hierarchy
  -> Material parameters
  -> Morph/bone bindings
```

V0 currently resolves the asset reference and expression profile rather than exposing the full composition pipeline.

## Customization

Customization is designed to be data-driven. Adding a hairstyle or accessory must not require renderer changes. The complete runtime customization facade is planned for a later phase.

## Determinism

Given the same definition, asset manifest version and engine version, the runtime should produce the same logical avatar state. Floating-point GPU pixels are not required to be bit-identical across devices.

## Versioning

Definitions carry a schema version. Migrations must be explicit:

```
v1 -> migrate -> v2
```

Never silently reinterpret old definitions.

## Future full-body extension

The model reserves room for torso, clothing, hands, legs, footwear and body proportions, but V0 remains head-focused.
