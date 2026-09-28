# Public API

The public API is intentionally small and reflects the current V0 runtime.

## Core creation

```ts
const avatar = createRuntime(definition, renderer);
```

The current AvatarDefinition contains a schema version, logical asset ID and expression profile ID.

## Runtime operations

```ts
avatar.load(asset);
avatar.update(deltaSeconds);
avatar.render();
avatar.resize(width, height);
avatar.pause();
avatar.resume();
avatar.destroy();
```

## Facial state

```ts
avatar.expression.setEmotion("happy", 1);
avatar.expression.setLipSync({ viseme: "aa", weight: 1 });
avatar.setLookAt({ x: 0.2, y: 0.1, z: 1 });
avatar.setFaceWeights({ mouthSmileLeft: 0.8 });
avatar.clearFaceWeights();
```

Direct face weights are an explicit override layer with higher priority than built-in expression sources. They are not written directly into the renderer and therefore survive subsequent update calls.

## Expression sources

Custom deterministic expression sources can be attached through:

```ts
avatar.expression.addSource(source);
avatar.expression.removeSource("animation");
```

The source contract is framework-agnostic and renderer-independent.

## Animation integration

`@toon2.5d/animation` is intentionally separate from core. Its AnimationPlayer can be converted into an ExpressionSource and attached to the runtime:

```ts
const player = createAnimationPlayer();
avatar.expression.addSource(animationSource(player));
```

The current player supports deterministic single-clip playback. State machines, crossfading and multi-clip blending are not yet part of V0.

## React adapter

Current adapter:

```tsx
<ToonAvatar
  character={character}
  width={320}
  height={320}
/>
```

The current React adapter owns canvas mounting, runtime creation, the requestAnimationFrame scheduler and cleanup. Expression, animation and interaction props shown in older target examples are not currently implemented.

## Target API

Character facades, animation controllers, typed runtime events and richer React props remain planned public API layers. They must not be treated as implemented until exported and covered by integration tests.

## API stability

Public exports are versioned and documented. Internal files are not public API unless explicitly exported from package entry points.
