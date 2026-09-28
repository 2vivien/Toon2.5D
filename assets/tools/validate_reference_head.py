import bpy
from pathlib import Path

PARAMETERS="""eyeBlinkLeft eyeLookDownLeft eyeLookInLeft eyeLookOutLeft eyeLookUpLeft eyeSquintLeft eyeWideLeft eyeBlinkRight eyeLookDownRight eyeLookInRight eyeLookOutRight eyeLookUpRight eyeSquintRight eyeWideRight jawForward jawLeft jawRight jawOpen mouthClose mouthFunnel mouthPucker mouthLeft mouthRight mouthSmileLeft mouthSmileRight mouthFrownLeft mouthFrownRight mouthDimpleLeft mouthDimpleRight mouthStretchLeft mouthStretchRight mouthRollLower mouthRollUpper mouthShrugLower mouthShrugUpper mouthPressLeft mouthPressRight mouthLowerDownLeft mouthLowerDownRight mouthUpperUpLeft mouthUpperUpRight browDownLeft browDownRight browInnerUp browOuterUpLeft browOuterUpRight cheekPuff cheekSquintLeft cheekSquintRight noseSneerLeft noseSneerRight tongueOut""".split()

root=Path(__file__).resolve().parents[1]/"generated"/"head.reference.glb"
if not root.is_file() or root.stat().st_size==0:raise SystemExit("reference GLB is missing")
bpy.ops.import_scene.gltf(filepath=str(root),merge_vertices=False)
found=set()
for obj in bpy.context.scene.objects:
    if obj.type!="MESH" or not obj.data.shape_keys:continue
    found.update(key.name for key in obj.data.shape_keys.key_blocks if key.name!="Basis")
missing=[name for name in PARAMETERS if name not in found]
if missing:raise SystemExit(f"Missing facial shape keys: {','.join(missing)}")
print(f"Validated {len(PARAMETERS)} facial shape keys in {root}")
