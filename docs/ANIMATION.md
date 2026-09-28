# Animation System

## Separation of concerns

Expression = current facial state.

Animation = change through time.

Pose = spatial state.

The three systems can interact but must remain conceptually separate.

## Current V0 stack

```
AnimationPlayer
    |
    +--> Clip
    +--> Tracks
    +--> Keyframes
    +--> Interpolation
    |
    v
ExpressionSource
    |
    v
Core ExpressionController
```

The animation package is intentionally independent from core. The host application attaches the generated ExpressionSource to the runtime.

## Current capabilities

V0 supports:

- deterministic keyframe sampling;
- single-clip playback;
- optional looping;
- linear and smoothstep interpolation;
- conversion of animation output into semantic face contributions.

## Not yet implemented

The following remain future animation layers:

- animation state machine;
- transition graph;
- crossfading;
- multi-clip blending;
- dedicated AnimationController facade;
- animation events.

These must not be presented as current V0 capabilities.

## Expression pipeline

Expression sources are evaluated deterministically:

1. emotion;
2. lip-sync;
3. blink;
4. look-at;
5. animation/custom sources;
6. external face overrides;
7. composition;
8. facial constraints;
9. renderer application.

Every source produces semantic facial contributions. The renderer only applies the final resolved weights.

## Expressions

Expressions are normalized parameter sets. For example:

```
happy = {
  mouthSmileLeft: 0.82,
  mouthSmileRight: 0.82
}
```

## Blendshapes

Blendshapes/morph targets are preferred for fine facial deformation. Bones are preferred for structural movement such as head, jaw or hair where appropriate.

## Interpolation

Default continuous properties use smooth interpolation. Discrete asset selections do not interpolate.

For a scalar:

```
x(t) = (1-u)x_0 + ux_1
```

where `u` is normalized time.

## Composition

Expression contribution composition is separate from animation clip blending. Contributions are resolved by explicit priority and blend mode. Direct face overrides use the highest priority and are represented as a source rather than mutating renderer state.

## Determinism

Animation time is driven by elapsed time supplied to the runtime. Tests advance time manually and do not require requestAnimationFrame.

## Future facial tracking

A tracking adapter can map landmarks to normalized facial parameters without changing the renderer or core semantic contract.
