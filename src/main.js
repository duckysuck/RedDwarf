import * as THREE from 'three';

// --- Core scene: dark industrial deck, warm pooled light, atmospheric fog ---
// Visual target: stylized/atmospheric (see docs/ART_DIRECTION.md), not photoreal.

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070a);
scene.fog = new THREE.FogExp2(0x05070a, 0.045);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.9, metalness: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Placeholder crew capsule (stand-in until real character rigs land)
const crew = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.4, 1.2, 4, 8),
  new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.6 })
);
crew.position.y = 1;
scene.add(crew);

// Dim ambient + warm pooled point lights, in the Lost Cathedral mood
scene.add(new THREE.AmbientLight(0x202830, 0.6));

const pool1 = new THREE.PointLight(0xffb060, 6, 10, 2);
pool1.position.set(-3, 3, -2);
scene.add(pool1);

const pool2 = new THREE.PointLight(0x60a0ff, 4, 10, 2);
pool2.position.set(3, 3, 1);
scene.add(pool2);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  crew.rotation.y += 0.004;
  renderer.render(scene, camera);
}
animate();
