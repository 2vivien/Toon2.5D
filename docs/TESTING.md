# Testing Strategy

## Unit

Test math, transforms, interpolation, expression blending, facial sources, schema validation and asset resolution.

## Runtime integration

Test initialization, load, update, resize, pause/resume, explicit overrides and disposal.

## Browser

Playwright browser tests are planned for:

- first render;
- customization;
- animation;
- responsive canvas;
- failure handling.

They are not yet part of the current automated V0 suite.

## Visual regression

Canonical scenes are planned:

- front neutral;
- front happy;
- left 30 degrees;
- right 30 degrees;
- pitch limits;
- blink;
- hair/accessory variants.

Use fixed camera, lighting and asset versions.

## Asset contract tests

The reference asset generator and validator enforce the current facial asset contract. Every production pack should pass structural validation before publication.

## Performance

The benchmark suite covers deterministic expression work. Browser regression coverage now runs the real Studio bundle in headless Chromium, verifies canvas output, frame-time budget, and repeated-mount observable heap growth. The CI browser gate is a release check.

Record:

- load;
- decode;
- first render;
- frame time;
- memory behavior.

## Deterministic time

Animation tests use explicit elapsed time instead of real requestAnimationFrame.

## Failure tests

Required failure coverage includes:

- missing asset;
- malformed manifest;
- unsupported compression;
- renderer failure;
- context loss;
- repeated destroy;
- duplicate load;
- cancellation.

Current coverage is partial; context-loss and browser failure paths remain future test gates.

## Release gate

No stable release without unit, integration, browser, asset and performance gates.
