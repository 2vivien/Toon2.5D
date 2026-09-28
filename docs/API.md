# Public API

The public runtime exposes:

- load(asset)
- update(deltaSeconds)
- render()
- resize(width, height)
- expression.setEmotion(...)
- expression.setLipSync(...)
- setLookAt(...)
- setFaceWeights(...)
- pause()
- resume()
- destroy()
- setPerspectiveCamera(...)
- setLookAtPose(...)
- applyCustomization(...)
- setQuality(...)

Animation adapters expose:

- attachAnimation(runtime, player)
- attachStateMachine(runtime, machine)
- attachMultiClip(runtime, player)

The renderer contract remains semantic: applications do not manipulate Three.js morphTargetInfluences directly.

React owns canvas lifecycle and requestAnimationFrame scheduling. Studio uses the same runtime rather than a second engine.
