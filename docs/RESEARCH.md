# External Research

Research date: 2026-09-28.

We studied existing open-source avatar runtimes, character creators and 3D asset standards before implementation. The goal is to reuse proven engineering patterns without copying an existing architecture blindly.

## CharacterStudio / M3-org
https://github.com/M3-org/CharacterStudio

This is one of the closest references to our future Studio layer. Its documented features include interchangeable character parts, texture editing, GLB/VRM export, programmable animation, asset packs separated from the application, and a CharacterManager that no longer requires React.

Lessons:
- separate the editor from asset packs;
- keep character composition in a framework-independent manager;
- treat optimization as a pipeline;
- keep Studio downstream from the runtime;
- texture atlasing and mesh merging can reduce draw calls.

Our difference: Toon2.5D starts engine-first and targets a constrained social-avatar head.

## pixiv/three-vrm
https://github.com/pixiv/three-vrm

A mature Three.js bridge for VRM. The project uses packages, examples, guides and tests, and supports GLTFLoader integration plus a WebGPU path.

Lessons:
- use glTF and extension mechanisms;
- make humanoid, expressions and look-at explicit subsystems;
- use loader plugins;
- optimize geometry, skeletons and morphs;
- keep WebGPU as a future renderer capability.

Our difference: we are not a generic VRM runtime; we control the avatar asset contract.

## 3D-character-creator
https://github.com/adorablemussel/3D-character-creator

A web character builder using interchangeable parts and Three.js, with persistence and export.

Lessons:
- customization naturally becomes a serializable data model;
- preview/export should be separated from runtime composition;
- backend persistence belongs outside the rendering core.

## Ready Player Me Visage
https://github.com/readyplayerme/visage

An npm package exposing a high-level React avatar component.

Lesson: the common SDK case should be extremely small. Toon2.5D should hide Three.js complexity behind a compact API.

## VerseEngine/three-avatar and avatar-stage

These projects demonstrate modular avatar runtime capabilities such as rig detection, animation, expressions, lip sync and replaceable subsystems.

Lesson: subsystem boundaries are preferable to one giant Avatar class.

## Webaverse
https://github.com/webaverse-studios/webaverse

A broad browser 3D engine using open standards and Three.js.

Lesson: do not turn Toon2.5D into a general game engine. Keep the scope narrow.

## Khronos glTF
https://www.khronos.org/gltf/

glTF is designed as an API-neutral runtime delivery format and can represent scenes, transforms, meshes, materials, textures, skins and animations.

Decision: GLB/glTF is our canonical runtime asset format.

## VRM expressions

VRM defines expressions using morph targets, material colors and texture transforms, and specifies an execution order for look-at, expressions, constraints and secondary motion.

Decision: expression evaluation order is part of our runtime contract.

## Three.js GLTFLoader

Three.js GLTFLoader supports important glTF extensions including Draco, Meshopt, KTX2/BasisU, WebP and instancing-related extensions.

Decision: use established glTF compression mechanisms rather than inventing proprietary asset formats.

## Combined conclusion

Stable character schema + framework-independent runtime + GLB/glTF + Three.js adapter + explicit expression/animation controllers + shared immutable assets + measured optimization + small npm API is the strongest foundation for Toon2.5D.
