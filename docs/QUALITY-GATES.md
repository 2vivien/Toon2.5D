# Quality Gates

Before a release can be considered stable:

## Architecture

- no dependency cycle
- core has no UI/renderer framework dependency
- public exports documented
- lifecycle and ownership rules tested

## Runtime

- avatar can load
- avatar can render
- avatar can animate
- avatar can resize
- avatar can dispose without retained engine resources

## Assets

- manifest validates
- missing required assets fail clearly
- cache works
- versioned assets do not collide

## Mathematics

- transform composition tests
- look-at limits tests
- interpolation tests
- blendshape clamping tests

## Browser

- Chromium smoke test
- supported-browser matrix documented
- context-loss behavior investigated

## Performance

- benchmark representative head
- record startup/load/render metrics
- no unexplained regression beyond project budget

## Packaging

- ESM output
- type declarations
- exports map
- no accidental dev dependencies in runtime
- package contents inspected before publishing

## Documentation

- README works from a fresh checkout
- API examples are executable or tested
- migration notes exist for breaking schema/API changes
