# Studio-Grade Release Gates

The release gate is executable, not documentary.

Required checks:

- workspace build;
- strict TypeScript typecheck;
- unit and integration tests;
- Blender reference GLB generation and 52-morph validation;
- Playwright Studio browser smoke;
- sustained browser frame-time p95 under the configured CI budget.

Physical GPU timings are deployment-specific and are not represented as deterministic CI values.
