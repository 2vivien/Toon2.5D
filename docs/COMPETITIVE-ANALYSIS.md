# Competitive and Reference Analysis

This is a technical comparison, not a ranking.

| Project | Role | Main technology | Key lesson |
|---|---|---|---|
| @pixiv/three-vrm | VRM runtime | Three.js | Standards, expressions and runtime boundaries |
| M3 CharacterStudio | Avatar editor | Three.js/WebGL/React | Asset packs and optimization |
| Ready Player Me Visage | Web avatar package | Three.js/R3F | Small npm-facing API |
| VerseEngine/three-avatar | Avatar runtime | Three.js | Replaceable avatar subsystems |
| avatar-stage | GLB avatar toolkit | Three.js | Package/demo separation |
| Webaverse | General 3D engine | Three.js | Avoid excessive scope |

## Gap

Existing projects tend to optimize for generic VRM interoperability, displaying an existing avatar, full editors, or broad game/metaverse systems.

Toon2.5D combines:
- customizable social-avatar head;
- small developer API;
- framework-independent runtime;
- controlled stylized visual system;
- strict performance budgets;
- npm distribution;
- future Studio.

## Non-goals

We will not replace VRM, glTF or Three.js. We will not build a general game engine, support every humanoid rig in V0, or target photorealism.
