# Architecture

## Runtime layers

```text
Core Domain                 Renderer Context
    │                            │
Character Model              Resource Manager
Expression State             Asset Cache
Animation State              GPU Context
    └──────────────┬─────────────┘
                   │
            Renderer Contract
              /             \\
           WebGL           WebGPU
              \             /
               Shared Scheduler
                      │
                Avatar Instances
                      │
                 Studio / React
```

## Renderer isolation

A renderer owns GPU context and resources. Each `RendererScene` owns an isolated native scene graph, cameras and avatar root. Rendering one instance never submits another instance's scene graph.

The shared renderer schedules those independent scenes using visibility, frustum tests, priority and quality adaptation.

## Asset boundary

```text
Asset ID → Registry → Resolver → Manifest → Validation/Integrity → Cache → Renderer Resource
```

Remote model and texture resources require HTTPS. Development may explicitly use HTTP only for localhost.

## WebGL/WebGPU parity

Both backends implement the same renderer contract for perspective camera, LookAt pose, face/customization state, palette, quality, animation access and scene lifecycle.

## Studio

Studio uses the same runtime contracts for asset browsing, palette editing, animation markers, camera/quality controls and bone authoring.
