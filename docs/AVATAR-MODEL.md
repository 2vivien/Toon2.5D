# Avatar Model

## Objective

Represent an avatar as a stable, serializable definition rather than a framework component.

## V1 runtime shape

The V1 runtime keeps a stable logical asset definition while CharacterDefinition provides composable body, face, skin, hair, eyes, brows, nose, mouth, clothing, accessories, colors and expressions:

```ts
type AvatarDefinition = {
  schemaVersion: 1;
  assetId: string;
  expressionProfileId: string;
};
```

It identifies the logical asset and semantic facial profile used by the runtime.

## CharacterDefinition compositional model

The current CharacterDefinition supports:

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

This richer model is part of the V1 runtime contract and resolves stable Asset IDs through the configured AssetResolver.

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

The runtime resolves every CharacterDefinition part through the AssetResolver before applying slot-based customization.

## Customization

Customization is designed to be data-driven. Adding a hairstyle or accessory must not require renderer changes. The runtime customization facade supports slot-based asset and texture replacement with validation and renderer-owned disposal.

## Determinism

Given the same definition, asset manifest version and engine version, the runtime should produce the same logical avatar state. Floating-point GPU pixels are not required to be bit-identical across devices.

## Versioning

Definitions carry a schema version. Migrations must be explicit:

```
v1 -> migrate -> v2
```

Never silently reinterpret old definitions.

## Future full-body extension

The model reserves room for torso, clothing, hands, legs, footwear and body proportions, but V1 remains compatible with the reference head while reserving full-body slots for composable character assets.
