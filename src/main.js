import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// --- Core scene: dark industrial deck, warm pooled light, atmospheric fog ---
// Visual target: stylized/atmospheric (see docs/ART_DIRECTION.md), not photoreal.
// Bloom on light sources + low ambient + warm/cool pooled lights is doing the
// heavy lifting here, not geometry/texture detail.

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

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.9,  // strength
  0.6,  // radius
  0.15  // threshold — only lit/emissive pixels bloom, not the dark base
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

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

// Dim ambient + warm pooled point lights, in the Lost Cathedral mood.
// Each light gets a small emissive fixture mesh so bloom has something to
// catch — point lights alone illuminate surfaces but render no visible source.
scene.add(new THREE.AmbientLight(0x202830, 0.6));

function addLightPool(color, position, intensity) {
  const light = new THREE.PointLight(color, intensity, 10, 2);
  light.position.copy(position);
  scene.add(light);

  const fixture = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshBasicMaterial({ color })
  );
  fixture.position.copy(position);
  scene.add(fixture);

  return light;
}

addLightPool(0xffb060, new THREE.Vector3(-3, 3, -2), 6);
addLightPool(0x60a0ff, new THREE.Vector3(3, 3, 1), 4);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  crew.rotation.y += 0.004;
  composer.render();
}
animate();
