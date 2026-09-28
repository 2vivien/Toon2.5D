# Roadmap

## V1 consolidation status

The V1 foundation and final consolidation cover strict TypeScript builds, isolated renderer scenes, shared scheduling, WebGL/WebGPU parity, secure model and texture asset resolution, CharacterDefinition composition, multi-accessories, runtime animation markers, quality adaptation, Studio authoring controls, browser performance/context gates, package metadata and documentation consistency.

## External release setup

The repository cannot configure an npm account's Trusted Publisher relationship. Before the first production publish, configure the npm Trusted Publisher for this GitHub repository and the release workflow filename. npm requires the package repository URL to exactly match the publishing repository and trusted publishing uses GitHub OIDC.

## Post-V1 evolution

Future work is outside the V1 release gate: richer timeline tooling, additional renderer backends, advanced GPU telemetry, additional asset codecs and expanded rig constraints.
