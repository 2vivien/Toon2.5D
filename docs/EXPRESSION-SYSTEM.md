# Toon2.5D — Facial Expression System

## 1. Purpose

The facial system is the core differentiator of Toon2.5D.

It must produce faces that feel coherent, readable and alive while remaining deterministic and inexpensive.

The system is inspired by VRM's explicit separation of look-at, expressions, constraints and secondary motion, but Toon2.5D defines its own smaller semantic model. VRM documents the order look-at → expression update/apply → constraints → spring/secondary motion. citeturn0search0turn0search14

## 2. Golden rule

Never map:

emotion -> raw morph target

Instead:

```
Emotion
  ↓
Semantic face intent
  ↓
Expression composition
  ↓
Constraints
  ↓
Asset mapping
  ↓
Morph / bone / material output
```

This keeps emotion independent from a particular Blender topology.

## 3. Sources

Every source implements the same conceptual contract:

```
sourceId
priority
enabled
evaluate(context)
```

Current V1 sources:

- EmotionSource
- BlinkSource
- LookAtSource
- LipSyncSource
- AnimationSource
- ExternalInputSource

A source returns contributions, not renderer commands.

## 4. Semantic layer

The semantic layer is the stable vocabulary of the engine.

Examples:

- smile;
- frown;
- mouthOpen;
- pucker;
- jawOpen;
- blinkLeft;
- blinkRight;
- eyeSquint;
- browRaise;
- browFurrow;
- cheekRaise;
- cheekPuff;
- noseWrinkle;
- lookHorizontal;
- lookVertical.

Asset packs translate this vocabulary to concrete morph targets.

## 5. Why semantic parameters matter

Different meshes may implement a smile with different morph names.

One asset may use:

```
mouthSmile
```

another:

```
Smile.L
Smile.R
```

The runtime must not care.

The asset manifest owns this mapping.

## 6. Emotion representation

An emotion is a structured intent:

```
EmotionState
  id
  intensity
  transition
  priority
  parameters
  overrides
```

Emotion parameters are normalized.

The default emotion library should include:

- neutral;
- happy;
- sad;
- angry;
- surprised;
- fearful;
- disgusted;
- relaxed.

These names are labels for parameter presets, not claims about psychological truth.

## 7. Emotion transitions

Never snap between expressive states unless explicitly requested.

Default transition:

```
previous state
      ↓
curve
      ↓
target state
```

Use configurable attack/release curves.

A short smile can rise quickly and release more slowly.

Transition timing is data, not hard-coded in the renderer.

## 8. Emotion intensity

Intensity scales semantic contributions before composition.

For a parameter p:

```
p' = clamp(p × intensity, 0, 1)
```

Intensity must not bypass constraints.

## 9. Source priority

Recommended default priority:

- base: 0
- emotion: 20
- animation: 30
- lipSync: 40
- blink: 50
- lookAt: 60
- external explicit override: 100

Priority alone does not define behavior.

The blend mode and parameter mask are also required.

## 10. Parameter ownership

Each source should own only the parameters it logically controls.

Examples:

Emotion:
- smile;
- cheek raise;
- brow state;
- mouth posture.

Blink:
- eye closure.

LookAt:
- gaze;
- optionally eye-related expression channels.

LipSync:
- mouth opening;
- vowel/viseme channels.

This prevents accidental subsystem conflicts.

## 11. Mouth composition

Mouth animation is especially conflict-prone.

Use separate semantic channels:

```
posture
aperture
shape
jaw
```

Emotion primarily controls posture.

Lip sync primarily controls aperture and shape.

Jaw animation controls structural opening.

The compositor combines them before constraints.

## 12. Eye composition

Eyes are split into:

```
gaze
closure
squint
brow
```

Look-at owns gaze.

Blink owns closure.

Emotion may influence squint and brow.

This allows a happy face to look left while blinking naturally.

## 13. Blink model

Automatic blinking must not be a fixed timer.

Use a bounded stochastic scheduler with deterministic seed support for tests.

Parameters:

- minimum interval;
- maximum interval;
- close duration;
- hold duration;
- open duration;
- optional double-blink probability.

The random source must be injectable.

## 14. Look-at model

The target is converted into avatar-local coordinates.

Compute normalized horizontal and vertical intent.

Apply:

- dead zone;
- range limits;
- smoothing;
- optional expression-based eye deformation.

Look-at can therefore drive eye bones, morph targets, or both through the asset mapping.

VRM similarly defines both bone-based and expression-based look-at mechanisms. citeturn0search5

## 15. Lip-sync model

Lip sync consumes normalized input.

Current source contract:

```
visemeId
weight
timestamp
duration
```

The engine does not own speech recognition.

Adapters may later provide:

- phoneme events;
- viseme events;
- audio amplitude;
- external speech engines.

## 16. Expression compositor

Composition occurs in four stages:

1. collect contributions;
2. blend by parameter;
3. apply explicit overrides;
4. clamp and validate.

Then the final semantic state is mapped to assets.

## 17. Constraints

Constraints are a safety and quality layer.

Examples:

- smile cannot force impossible mouth closure;
- jaw opening can increase maximum mouth aperture;
- blink can suppress incompatible squint;
- cheek deformation has a profile-specific ceiling;
- left/right asymmetry remains within asset limits.

Constraints must be deterministic and testable without a renderer.

## 18. Asset mapping

The manifest may define:

```
semanticParameter
  -> morph target
  -> weight scale
  -> optional curve
  -> optional side
```

A semantic value of 0.5 does not have to become a raw morph weight of 0.5.

This is essential for artistic control.

## 19. Expression profiles

An asset pack can define an expression profile containing:

- supported parameters;
- morph mappings;
- bone mappings;
- material mappings;
- limits;
- default curves;
- compatibility version.

This allows multiple heads to share the same engine.

## 20. Animation interaction

Animation may produce expression contributions.

It must not directly mutate the expression controller's internal state.

Example:

```
AnimationSource
  -> smile = 0.35
```

The expression compositor decides how that interacts with emotion and lip sync.

## 21. External tracking

A future face-tracking adapter should convert landmarks into semantic parameters.

```
Camera / AR input
      ↓
Tracking adapter
      ↓
Semantic face parameters
      ↓
Expression controller
```

The engine remains independent from the tracking SDK.

## 22. Determinism

For the same:

- character;
- source states;
- input values;
- elapsed time;
- random seed;

the expression output must be identical.

This property is required for tests and visual regression.

## 23. Failure behavior

Invalid expression input must never produce NaN or Infinity.

The controller must:

- clamp documented numeric ranges;
- reject invalid identifiers;
- reject non-finite numbers;
- return typed validation errors;
- preserve the previous valid state when an update is rejected.

## 24. Research lessons

CharacterStudio separates emotion, blink, look-at and lip-sync managers inside its CharacterManager architecture. That validates the value of distinct subsystem boundaries, while Toon2.5D goes further by making their shared output a typed semantic expression layer. citeturn0search3turn0search9

Ready Player Me Visage demonstrates the value of hiding the 3D runtime behind a compact high-level package API. Toon2.5D will apply the same principle without making React a core dependency. citeturn0search1

VRM provides the strongest reference for explicit expression composition, normalized expression values and execution ordering. citeturn0search0turn0search14
