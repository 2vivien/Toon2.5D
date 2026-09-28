import bpy
import math
from pathlib import Path

ARKIT_52=[
"eyeBlinkLeft","eyeLookDownLeft","eyeLookInLeft","eyeLookOutLeft","eyeLookUpLeft","eyeSquintLeft","eyeWideLeft",
"eyeBlinkRight","eyeLookDownRight","eyeLookInRight","eyeLookOutRight","eyeLookUpRight","eyeSquintRight","eyeWideRight",
"jawForward","jawLeft","jawRight","jawOpen","mouthClose","mouthFunnel","mouthPucker","mouthLeft","mouthRight",
"mouthSmileLeft","mouthSmileRight","mouthFrownLeft","mouthFrownRight","mouthDimpleLeft","mouthDimpleRight",
"mouthStretchLeft","mouthStretchRight","mouthRollLower","mouthRollUpper","mouthShrugLower","mouthShrugUpper",
"mouthPressLeft","mouthPressRight","mouthLowerDownLeft","mouthLowerDownRight","mouthUpperUpLeft","mouthUpperUpRight",
"browDownLeft","browDownRight","browInnerUp","browOuterUpLeft","browOuterUpRight","cheekPuff","cheekSquintLeft",
"cheekSquintRight","noseSneerLeft","noseSneerRight","tongueOut"
]

def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

def add_material(name,color,roughness):
    material=bpy.data.materials.new(name)
    material.diffuse_color=(*color,1)
    material.roughness=roughness
    return material

def add_shape_keys(head):
    head.shape_key_add(name="Basis")
    for name in ARKIT_52:
        key=head.shape_key_add(name=name)
        for vertex in key.data:
            co=vertex.co
            if name.startswith("eyeBlink"):
                side=-1 if name.endswith("Left") else 1
                if abs(co.x-side*.34)<.3 and co.z>.0 and co.y<-.55: vertex.co.z-=.08
            elif name.startswith("eyeWide"):
                side=-1 if name.endswith("Left") else 1
                if abs(co.x-side*.34)<.3 and co.z>.0 and co.y<-.55: vertex.co.z+=.08
            elif name.startswith("mouthSmile") or name.startswith("mouthFrown"):
                side=-1 if name.endswith("Left") else 1
                if abs(co.x-side*.55)<.3 and co.z<-.05 and co.y<-.55:
                    vertex.co.z += .07 if "Smile" in name else -.07
            elif name=="jawOpen":
                if co.z<-.15 and co.y<-.45: vertex.co.z-=.13
            elif name.startswith("brow"):
                if co.z>.25 and co.y<-.5:
                    vertex.co.z += .07 if "Up" in name or name=="browInnerUp" else -.06
            elif name.startswith("cheek"):
                if abs(co.z)<.25 and co.y<-.55: vertex.co.y-=.04
            elif name.startswith("nose"):
                if abs(co.x)<.3 and abs(co.z)<.2 and co.y<-.7: vertex.co.y-=.05
            elif name.startswith("mouth"):
                if co.z<.05 and co.y<-.6: vertex.co.y-=.025

def build():
    reset_scene()
    skin=add_material("ToonSkin",(0.74,0.38,0.24),.8)
    white=add_material("ToonEye",(1,1,1),.35)
    dark=add_material("ToonPupil",(0.02,0.02,0.02),.3)
    lip=add_material("ToonMouth",(0.25,0.04,0.07),.65)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,radius=1,location=(0,0,0))
    head=bpy.context.object
    head.name="Head"
    head.scale=(1,.95,.9)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    head.data.materials.append(skin)
    add_shape_keys(head)

    for name,x in [("Eye.L",-.34),("Eye.R",.34)]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.2,location=(x,-.86,.18))
        eye=bpy.context.object
        eye.name=name
        eye.data.materials.append(white)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,radius=.08,location=(x,-1.04,.18))
        pupil=bpy.context.object
        pupil.name=f"{name}.Pupil"
        pupil.data.materials.append(dark)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.24,location=(0,-.88,-.28))
    mouth=bpy.context.object
    mouth.name="Mouth"
    mouth.scale=(1,.35,.55)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mouth.data.materials.append(lip)

    root=bpy.data.objects.new("AvatarRoot",None)
    bpy.context.collection.objects.link(root)
    for obj in list(bpy.context.scene.objects):
        if obj!=root and obj.parent is None: obj.parent=root

    output=Path(bpy.path.abspath("//generated/head.reference.glb"))
    output.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        export_yup=True,
        export_materials="EXPORT",
        export_morph=True,
        export_morph_normal=False,
        export_morph_tangent=False,
        export_meshopt_compression_enable=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_apply=True
    )
    print(f"Toon2.5D reference head: {output}")

build()
