# Mathematics and Geometry Rules

This document defines the mathematical conventions of Toon2.5D.

## Coordinate system

Use a right-handed coordinate system consistent with Three.js:

- +X: right
- +Y: up
- +Z: toward the viewer/camera convention as configured by the scene

The engine must document camera direction explicitly at the renderer boundary.

## Transform

A node transform is:

```
T = Translation * Rotation * Scale
```

Local transforms compose through the scene hierarchy.

For parent P and local transform L:

```
World = P_world * L_local
```

## Quaternion policy

Use quaternions internally for 3D rotations where interpolation or composition is required. Euler angles may be exposed as ergonomic API inputs.

Never linearly interpolate Euler angles for animation when quaternion interpolation is required.

## Spherical look-at

Given head position H and target P:

```
d = P - H
```

Normalize:

```
n = d / ||d||
```

Clamp yaw/pitch before converting to the final rotation.

## Normalized parameters

User-facing parameters should normally be normalized:

```
0 = minimum
0.5 = neutral
1 = maximum
```

This keeps definitions independent from model dimensions.

## Blendshape combination

For morph weights:

```
M = M_0 + Σ w_i ΔM_i
```

where `w_i ∈ [0,1]` unless a model explicitly permits another range.

The runtime clamps weights to declared limits.

## Linear interpolation

```
lerp(a,b,t) = a + (b-a)t
```

with `t` clamped to [0,1] for standard tracks.

## Smoothstep

For simple easing:

```
s(t) = t²(3 - 2t)
```

Useful for subtle facial transitions.

## Head rotation constraints

Yaw, pitch and roll limits must be asset/profile-defined rather than hard-coded globally.

Example concept:

```
yaw ∈ [-35°, +35°]
pitch ∈ [-20°, +20°]
roll ∈ [-10°, +10°]
```

These are starting defaults, not universal constants.

## Parallax

If a future 2.5D presentation layer is used, perceived offset can be modeled as:

```
offset = depthFactor * cameraDelta
```

but true 3D geometry remains preferred whenever available.

## Performance mathematics

Frame time budget at 60 FPS:

```
16.67 ms/frame
```

At 120 FPS:

```
8.33 ms/frame
```

The engine must not assume every device can sustain either budget; quality tiers adapt to hardware.
