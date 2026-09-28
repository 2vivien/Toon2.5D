# Animation

The animation runtime is deterministic and renderer-independent.

## Player

AnimationPlayer supports validated single-clip playback, looping, interpolation and ExpressionSource attachment.

## State machine

AnimationStateMachine supports named states, loop/speed settings, numeric parameters, triggers, transition conditions, enter/exit callbacks and transition callbacks.

A transition emits two weighted clip outputs. The triggering frame advances the fade so the output remains continuous.

## Multi-clip blending

MultiClipPlayer accepts uniquely identified layers with independent weight, time, loop and speed. Tracks are sampled and superposed into semantic face weights.

Both state-machine and multi-clip sources attach directly to ExpressionController through the runtime.

## Renderer animation

Three.js also provides AnimationMixer and AnimationAction for native GLB bone/morph animation. The semantic animation layer remains the public engine abstraction; native renderer animation stays inside renderer-three.

## Runtime rule

The host owns requestAnimationFrame. Animation sources consume the same runtime delta as emotion, blink, lip-sync and LookAt.
