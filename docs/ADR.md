# Architecture Decision Records

## ADR-001 — Real 3D, stylized 2.5D presentation

Status: Accepted.

We implement a real 3D avatar engine but target a stylized 2.5D visual result. This gives us true rotation, depth, occlusion and lighting while keeping the visual style lightweight.

## ADR-002 — Three.js as renderer infrastructure

Status: Accepted.

Three.js handles low-level 3D scene/rendering integration. Toon2.5D owns avatar semantics, assets, animation and runtime lifecycle.

## ADR-003 — GLB/glTF as canonical runtime asset format

Status: Accepted.

GLB is compact, portable and suitable for browser delivery. Authoring tools are decoupled from runtime.

## ADR-004 — Framework-agnostic core

Status: Accepted.

React is an adapter, not the engine. This permits vanilla JS and future frameworks without rewriting domain logic.

## ADR-005 — Head first

Status: Accepted.

The first product target is a customizable head. Full body is intentionally deferred so the runtime architecture can mature around a smaller problem.

## ADR-006 — Data-driven customization

Status: Accepted.

Assets are selected through stable logical IDs and manifests. Adding content must not require renderer changes.

## ADR-007 — Explicit resource ownership

Status: Accepted.

GPU leaks are unacceptable for a reusable library. Every resource must have a deterministic lifecycle.

## ADR-008 — Studio later

Status: Accepted.

The visual generator/editor is a consumer of the engine and must not dictate the engine's internal architecture.
