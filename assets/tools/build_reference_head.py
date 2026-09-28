import bpy
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

EYE_KEYS=[name for name in ARKIT_52 if name.startswith("eye")]
MOUTH_KEYS=[name for name in ARKIT_52 if name.startswith(("jaw","mouth")) or name=="tongueOut"]
BROW_KEYS=[name for name in ARKIT_52 if name.startswith("brow")]
FACE_KEYS=ARKIT_52

def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

def material(name,color,roughness):
    mat=bpy.data.materials.new(name)
    mat.diffuse_color=(*color,1)
    mat.use_nodes=True
    node=mat.node_tree.nodes.get("Principled BSDF")
    if node:
        node.inputs["Base Color"].default_value=(*color,1)
        node.inputs["Roughness"].default_value=roughness
    return mat

def mask(co,cx,cz,rx,rz,front=-.45):
    if co.y>front:return 0.0
    dx=(co.x-cx)/rx
    dz=(co.z-cz)/rz
    return max(0.0,1.0-(dx*dx+dz*dz))

def add_keys(obj,names,deform):
    obj.shape_key_add(name="Basis")
    for name in names:
        key=obj.shape_key_add(name=name)
        for vertex in key.data:
            delta=deform(name,vertex.co)
            vertex.co.x+=delta[0]
            vertex.co.y+=delta[1]
            vertex.co.z+=delta[2]

def head_deform(name,co):
    eye_side=-1 if name.endswith("Left") else 1
    eye=mask(co,eye_side*.34,.18,.30,.20)
    mouth=mask(co,0,-.30,.62,.25)
    cheek=mask(co,eye_side*.48,-.02,.42,.35)
    brow=mask(co,eye_side*.34,.40,.30,.18)
    if name.startswith("eyeBlink"):
        return (0,0,-.13*eye)
    if name.startswith("eyeWide"):
        return (0,0,.10*eye)
    if name.startswith("eyeSquint"):
        return (0,0,-.06*eye)
    if name.startswith("eyeLook"):
        return (0,0,.025*eye)
    if name=="jawOpen":
        return (0,0,-.15*max(mouth,mask(co,0,-.55,.7,.45)))
    if name=="jawForward": return (0,.06*mouth,0)
    if name=="jawLeft": return (-.06*mouth,0,0)
    if name=="jawRight": return (.06*mouth,0,0)
    if name.startswith("mouthSmile"):
        return (0,-.015*mouth,.10*mouth)
    if name.startswith("mouthFrown"):
        return (0,0,-.09*mouth)
    if name.startswith("mouthStretch"):
        return (.08*eye_side*mouth,0,.01*mouth)
    if name.startswith("mouthPucker") or name.startswith("mouthFunnel"):
        return (0,.07*mouth,0)
    if name.startswith("mouthClose") or name.startswith("mouthPress"):
        return (0,0,.035*mouth)
    if name.startswith("mouthUpperUp"): return (0,0,.055*mouth)
    if name.startswith("mouthLowerDown"): return (0,0,-.055*mouth)
    if name.startswith("mouthShrugUpper"): return (0,0,.045*mouth)
    if name.startswith("mouthShrugLower"): return (0,0,-.045*mouth)
    if name.startswith("mouthLeft"): return (-.055*mouth,0,0)
    if name.startswith("mouthRight"): return (.055*mouth,0,0)
    if name.startswith("cheekPuff"): return (0,-.055*cheek,0)
    if name.startswith("cheekSquint"): return (0,0,.045*cheek)
    if name.startswith("brow"):
        direction=.055 if "Up" in name else -.055
        return (0,0,direction*brow)
    if name.startswith("noseSneer"): return (0,-.035*cheek,0)
    return (0,0,0)

def eye_deform(name,co):
    if name.endswith("Left") and co.x>0:return (0,0,0)
    if name.endswith("Right") and co.x<0:return (0,0,0)
    if name.startswith("eyeBlink"): return (0,0,-.10)
    if name.startswith("eyeWide"): return (0,0,.08)
    return (0,0,0)

def mouth_deform(name,co):
    if name=="jawOpen": return (0,0,-.13)
    if name.startswith("mouthSmile"): return (0,0,.06)
    if name.startswith("mouthFrown"): return (0,0,-.05)
    if name.startswith(("mouthPucker","mouthFunnel")): return (0,.07,0)
    if name.startswith("mouthStretch"):
        return (.05 if name.endswith("Right") else -.05,0,0)
    if name.startswith("mouthUpperUp"): return (0,0,.05)
    if name.startswith("mouthLowerDown"): return (0,0,-.05)
    if name.startswith("mouthClose"): return (0,0,.03)
    return (0,0,0)

def add_uv(name,location,scale,mat,segments=32,rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=location)
    obj=bpy.context.object
    obj.name=name
    obj.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.data.materials.append(mat)
    return obj

def build():
    reset_scene()
    skin=material("ToonSkin",(0.74,.38,.24),.72)
    white=material("ToonEye",(1,1,1),.28)
    dark=material("ToonPupil",(.015,.012,.01),.2)
    lip=material("ToonMouth",(.28,.035,.055),.55)
    hair=material("ToonHair",(.055,.025,.018),.8)
    brow=material("ToonBrow",(.08,.035,.025),.82)

    head=add_uv("Head",(0,0,0),(1,.95,.9),skin)
    add_keys(head,FACE_KEYS,head_deform)

    for side,x in [("L",-.34),("R",.34)]:
        eye=add_uv(f"Eye.{side}",(x,-.86,.18),(.205,.12,.20),white,24,16)
        add_keys(eye,EYE_KEYS,eye_deform)
        pupil=add_uv(f"Eye.{side}.Pupil",(x,-.975,.18),(.075,.035,.075),dark,20,12)
        add_keys(pupil,EYE_KEYS,lambda n,c:(0,0,.025 if "LookUp" in n else -.025 if "LookDown" in n else 0))
        lid=add_uv(f"Eyelid.{side}",(x,-.955,.27),(.23,.045,.055),skin,24,12)
        add_keys(lid,EYE_KEYS,eye_deform)

    mouth=add_uv("Mouth",(0,-.91,-.28),(.25,.06,.11),lip,28,16)
    add_keys(mouth,MOUTH_KEYS,mouth_deform)

    for side,x in [("L",-.34),("R",.34)]:
        brow_obj=add_uv(f"Brow.{side}",(x,-.91,.43),(.22,.035,.055),brow,24,12)
        add_keys(brow_obj,BROW_KEYS,lambda n,c:(0,0,.07 if "Up" in n else -.055))

    haircap=add_uv("HairCap",(0,.02,.45),(1.01,.96,.62),hair,32,20)
    for i,(x,z,s) in enumerate([(-.72,.58,.34),(-.38,.72,.38),(0,.78,.40),(.38,.72,.38),(.72,.58,.34)]):
        add_uv(f"HairLock.{i}",(x,-.02,z),(s,.9*s,.42*s),hair,24,16)

    root=bpy.data.objects.new("AvatarRoot",None)
    bpy.context.collection.objects.link(root)
    for obj in list(bpy.context.scene.objects):
        if obj!=root and obj.parent is None: obj.parent=root

    output=Path(bpy.path.abspath("//generated/head.reference.glb"))
    output.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),export_format="GLB",export_yup=True,
        export_materials="EXPORT",export_morph=True,export_morph_normal=False,
        export_morph_tangent=False,export_meshopt_compression_enable=True,
        export_animations=False,export_cameras=False,export_lights=False,
        export_apply=False,export_try_sparse_sk=True
    )
    print(f"Toon2.5D reference head: {output}")

build()
