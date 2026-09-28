# Design Rules

## Visual language

Toon2.5D avatars should look:

- stylized
- friendly
- coherent
- readable at small sizes
- dimensional without photorealism

## Proportion rules

Proportions are model-family specific. Never encode arbitrary proportions in the renderer.

The renderer manipulates declared anchors, bones and morph targets.

## Silhouette first

At avatar-icon sizes, silhouette has higher priority than micro-detail.

Every new asset must be checked at:

- 64 px
- 128 px
- 256 px

## Face readability

Eyes, mouth and hair must remain visually distinct after lighting and downscaling.

Avoid details that disappear at common avatar sizes.

## Color rules

Use a controlled palette per material family.

Skin must support a broad range without forcing a fixed demographic palette.

Hair colors should be parameterized.

Avoid hard-coding application brand colors into the engine.

## Lighting rules

Lighting should reveal form, not dominate the face.

Avoid deep eye sockets, harsh nose shadows and extreme specular highlights unless an explicit style profile requests them.

## Hair rules

Hair is separated conceptually into back/front structures where required by the model.

Hair must not produce z-fighting with the head.

## Accessories

Accessories must define attachment points and compatibility constraints.

Example:

```
glasses -> face.front
earring -> ear.left/right
hat -> head.top
```

## Animation rules

No expression should require React re-rendering.

Animations must be subtle enough for repeated idle playback.

Blink timing must be randomized only through a seeded/runtime-controlled source when deterministic tests are required.

## UI/Studio rules

Studio is a separate product layer. It may expose controls for all engine parameters but must not redefine engine semantics.

## Accessibility

The engine itself is graphical, but host UI must expose textual controls, labels and keyboard access where applicable.
