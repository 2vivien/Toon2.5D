# Public API

The public API should be intentionally small.

## Core creation

```ts
const avatar = createToonAvatar({
  character,
  renderer,
  assets
});
```

## Runtime operations

```ts
avatar.update(deltaSeconds);
avatar.render();
avatar.resize(width, height);
avatar.pause();
avatar.resume();
avatar.destroy();
```

## Character

```ts
avatar.character.set(character);
avatar.character.patch({
  hair: { style: "curly.003" }
});
```

## Expression

```ts
avatar.expression.set("happy");
avatar.expression.setWeight("mouthSmile", 0.8);
```

## Animation

```ts
avatar.animation.play("idle");
avatar.animation.play("blink");
avatar.animation.stop("blink");
```

## Look-at

```ts
avatar.lookAt.setTarget({ x, y });
avatar.lookAt.clear();
```

## Events

Events must be typed:

- ready
- error
- animationStart
- animationEnd
- assetLoad
- disposed

## React adapter

Example target API:

```tsx
<ToonAvatar
  character={character}
  expression="happy"
  animation="idle"
  interactive
/>
```

The React adapter owns only mounting, props synchronization and cleanup.

## API stability

Public exports are versioned and documented. Internal files are not public API unless explicitly exported from package entry points.
