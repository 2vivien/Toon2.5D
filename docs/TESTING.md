# Testing Strategy

## Unit
Test math, transforms, interpolation, expression blending, state machines, schema validation and asset resolution.

## Runtime integration
Test initialization, load, update, resize, pause/resume and disposal.

## Browser
Use Playwright for first render, customization, animation, responsive canvas and failure handling.

## Visual regression
Canonical scenes:
- front neutral;
- front happy;
- left 30 degrees;
- right 30 degrees;
- pitch limits;
- blink;
- hair/accessory variants.

Use fixed camera, lighting and asset versions.

## Asset contract tests
Every production pack must pass structural validation before publication.

## Performance
Benchmark one avatar, repeated avatars and many avatars using shared resources. Record load, decode, first render, frame time and memory behavior.

## Deterministic time
Animation tests use injected time instead of real requestAnimationFrame.

## Failure tests
Missing asset, malformed manifest, unsupported compression, renderer failure, context loss, repeated destroy, duplicate load and cancellation.

## Release gate
No stable release without unit, integration, browser, asset and performance gates.
