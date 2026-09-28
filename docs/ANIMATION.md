# Animation System

## Separation of concerns

Expression = current facial state.

Animation = change through time.

Pose = spatial state.

The three systems can interact but must remain conceptually separate.

## Animation stack

```
State Machine
    |
    v
Animation Controller
    |
    +--> Timeline
    +--> Keyframes
    +--> Interpolation
    +--> Blend
    |
    v
Avatar State
```

## V0 animations

- idle
- blink
- look-at
- smile
- head turn
- simple expression transitions

## Expressions

Expressions are parameter sets:

```
happy = {
  mouthSmile: 0.8,
  cheekRaise: 0.35,
  eyeSquint: 0.15
}
```

Values are normalized where possible.

## Blendshapes

Blendshapes/morph targets are preferred for fine facial deformation. Bones are preferred for structural movement such as head/jaw/hair where appropriate.

## Interpolation

Default continuous properties use smooth interpolation. Discrete asset selections do not interpolate.

For a scalar:

```
x(t) = (1-u)x_0 + ux_1
```

where `u` is normalized time.

## Blending

If multiple animations affect the same property, each track declares a blend policy. The engine must prevent accidental last-write-wins behavior.

## Determinism

Animation time is driven by elapsed time supplied to the runtime. Tests should be able to advance the clock manually without requestAnimationFrame.

## Idle motion

Idle motion must be subtle. It should use low-amplitude periodic functions and avoid expensive per-frame allocations.

Example:

```
y(t) = y_0 + A sin(2πft + φ)
```

## Future facial tracking

A future tracking adapter can map landmarks to normalized facial parameters without changing the renderer.
