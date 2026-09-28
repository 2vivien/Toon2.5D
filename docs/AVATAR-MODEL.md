# Avatar Model

## Runtime model

Toon2.5D separates the logical character definition from renderer resources.

### CharacterDefinition

- `version: 1`
- `model: string`
- optional `CharacterPart`: body, face, skin, hair, eyes, brows, nose, mouth, top, bottom and shoes
- `accessories?: CharacterPart[]`
- `colors?: CharacterColors`
- `expression?: string`

### CharacterPart

```ts
interface CharacterPart {
  assetId: string;
  textureId?: string;
  morphs?: Partial<Record<FaceParameter, number>>;
}
```

Every model and texture reference is resolved through the asset registry/resolver before runtime loading.

### CharacterColors

```ts
interface CharacterColors {
  skin?: string;
  hair?: string;
  eyes?: string;
  top?: string;
  bottom?: string;
  shoes?: string;
  accessory?: string;
}
```

Palette changes are applied to renderer-owned materials without rebuilding the character definition.

### Composition

```text
CharacterDefinition
      ↓
AssetRegistry / AssetResolver
      ↓
Manifest validation + integrity + limits + trusted origin
      ↓
RendererScene
      ├── unique slots
      └── accessory instances
```

Morph bindings map semantic face parameters to GLB morph targets. Bindings may define curves, side semantics, bone mappings and material mappings. Head and eye bones are resolved from manifest rig mappings.
