# V1 Release Gates

V1 is released only from a commit that passes the complete executable validation chain.

## Required checks

1. Workspace build.
2. Strict TypeScript typecheck.
3. Unit and integration tests.
4. Reproducible Blender reference GLB generation and validation.
5. Playwright Studio browser smoke coverage.
6. Browser frame-time budget: p95 under 40 ms in the CI browser gate.
7. WebGL2 GPU timer regression signal when `EXT_disjoint_timer_query_webgl2` is available.
8. Repeated-mount observable heap-growth check when Chromium exposes `performance.memory`.
9. Executable documentation consistency check.
10. WebGL context-loss/restoration behavior covered by renderer lifecycle tests.

The GPU timer test measures an actual GPU command through WebGL2 timer queries. It is deliberately conditional because timer-query support is not universal. Unsupported environments are reported as skipped/unsupported rather than being treated as a measured pass.

The heap-growth test is conditional on Chromium exposing `performance.memory`; unsupported environments are reported without fabricating a measurement.

## What the GPU gate does not mean

The GPU gate is a regression signal for the CI rendering environment. It is not a promise of identical frame times on every physical GPU, browser, driver or operating system.

Application deployments should still profile representative target hardware.

## Visual coverage

The Studio browser test captures the rendered surface and validates the canvas dimensions and interactive controls. V1 treats this as browser visual smoke coverage; it does not claim pixel-identical golden-image comparison across hardware.

## Release rule

A release candidate must have all required deterministic checks passing. Environment-dependent GPU timing is recorded only when supported and is never fabricated.
