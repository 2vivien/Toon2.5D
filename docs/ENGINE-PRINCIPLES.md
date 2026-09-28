# Engine Principles

These rules are binding unless superseded by an ADR.

1. Domain before framework: Core must not depend on React, Next.js, DOM or React Three Fiber.
2. Renderer is replaceable: Three.js is the first adapter and core contracts must not expose Three.js types.
3. Assets are data: character definitions reference versioned logical asset IDs.
4. Shared assets, isolated state: immutable resources may be shared; animation, transforms and expression state are per instance.
5. No React in the frame loop.
6. No hidden network: core performs no telemetry or analytics.
7. Explicit lifecycle: every create path has a dispose path.
8. Measure before optimizing.
9. Serialized avatar definitions use explicit schema versions and migrations.
10. Public API stays small.
11. Studio and host applications own accessible UI.
12. Visual quality is a system: model, material, camera, lighting and animation are designed together.
13. Prefer established glTF ecosystem mechanisms over proprietary formats.
14. Head-first scope: full body is an extension.
15. Studio is downstream from the engine.
