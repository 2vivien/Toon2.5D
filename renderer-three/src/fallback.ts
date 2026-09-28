import * as THREE from "three";
export interface FallbackAvatarParts{readonly root:THREE.Group;readonly head:THREE.Mesh;readonly leftEye:THREE.Mesh;readonly rightEye:THREE.Mesh;readonly mouth:THREE.Mesh}
export function createFallbackAvatar():FallbackAvatarParts{
 const root=new THREE.Group();
 const head=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),new THREE.MeshStandardMaterial({color:0xf0b28f,roughness:.8}));
 const eyeMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5});const pupilMaterial=new THREE.MeshStandardMaterial({color:0x222222,roughness:.4});
 const eye=()=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(.22,20,16),eyeMaterial);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),pupilMaterial);pupil.position.z=.19;mesh.add(pupil);return mesh};
 const leftEye=eye(),rightEye=eye();const mouth=new THREE.Mesh(new THREE.SphereGeometry(.28,20,12),new THREE.MeshStandardMaterial({color:0x5b2530,roughness:.7}));
 head.scale.set(1,.92,.9);leftEye.position.set(-.34,.18,.86);rightEye.position.set(.34,.18,.86);mouth.position.set(0,-.28,.88);mouth.scale.set(1,.35,.3);root.add(head,leftEye,rightEye,mouth);
 return{root,head,leftEye,rightEye,mouth};
}
