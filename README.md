# Toon2.5D

A lightweight, production-grade 3D avatar engine designed to produce stylized 2.5D-looking avatars for web applications.

## Vision

Toon2.5D is not an avatar collection. It is an engine: a reusable runtime that hides WebGL, rendering, asset management, animation, camera, lighting, GPU lifecycle and performance concerns behind a stable developer API.

The first product target is a customizable stylized 3D head inspired by social-avatar experiences. The visual language is 2.5D; the implementation is real-time 3D.

## Core principles

- Engine first, Studio later.
- Framework agnostic core.
- Three.js is an implementation detail of the rendering adapter.
- GLB/glTF is the canonical runtime asset format.
- TypeScript is mandatory.
- Data-driven character definitions.
- Expressions and animations are separate systems.
- GPU resources have explicit ownership and disposal.
- No per-frame React state updates.
- Performance budgets are part of the architecture.
- Public APIs must remain smaller than internal APIs.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Tech Stack](docs/TECH-STACK.md)
- [Avatar Model](docs/AVATAR-MODEL.md)
- [Rendering](docs/RENDERING.md)
- [Assets](docs/ASSETS.md)
- [Animation](docs/ANIMATION.md)
- [Mathematics](docs/MATHEMATICS.md)
- [Design Rules](docs/DESIGN-RULES.md)
- [Performance](docs/PERFORMANCE.md)
- [API](docs/API.md)
- [Security](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture Decisions](docs/ADR.md)
- [Contributing](docs/CONTRIBUTING.md)

## Initial package direction

The repository starts as a monorepo and can publish independently versioned packages:

- @toon2.5d/core
- @toon2.5d/renderer-three
- @toon2.5d/assets
- @toon2.5d/animation
- @toon2.5d/react

The package graph must remain acyclic.

## Non-goals for V0

- photorealistic humans
- full-body production
- physics-heavy cloth or hair
- server-side rendering of WebGL
- custom WebGL implementation
- replacing Three.js mathematics or GPU primitives
