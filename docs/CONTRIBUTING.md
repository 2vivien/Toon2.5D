# Contributing

## Development principles

- Keep core independent of UI frameworks.
- Prefer explicit types over implicit runtime conventions.
- Keep public APIs small.
- Write tests for domain behavior.
- Avoid allocations in hot paths.
- Document architecture decisions.
- Do not add dependencies without a concrete reason.

## Commit style

Use focused commits:

```
feat(core): add avatar definition resolver
feat(renderer): add three renderer
fix(animation): clamp blend weights
docs: define asset manifest
```

## Pull requests

A PR should state:

- what changed
- why
- architectural impact
- performance impact
- tests
- breaking changes

## Tests

Required layers:

1. unit tests for math and domain logic
2. asset validation tests
3. renderer integration tests
4. browser visual/smoke tests
5. performance benchmarks as the project matures

## Definition of done

A feature is not done when it merely renders.

It must have:

- types
- tests
- lifecycle behavior
- disposal behavior
- documentation
- error behavior
- performance consideration

## Assets

Do not commit large binary assets casually. Production asset packs should be versioned intentionally and delivered through the asset pipeline/CDN where appropriate.

## Breaking changes

Use explicit versioning and migration notes for serialized avatar definitions.
