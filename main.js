import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

console.log('Starting initialization...');

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
console.log('Scene created');

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 50);
console.log('Camera created');

// Create renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#solarSystem'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
console.log('Renderer created and added to DOM');

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 100;
console.log('Controls created');

// Create Sun
const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 1
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);
console.log('Sun created and added to scene');

// Create Earth
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x2233ff,
    roughness: 0.7,
    metalness: 0.1
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.x = 15; // Distance from sun
scene.add(earth);
console.log('Earth created and added to scene');

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(sunLight);
console.log('Lighting added to scene');

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate sun
    sun.rotation.y += 0.004;
    
    // Rotate and orbit earth
    earth.rotation.y += 0.02;
    earth.position.x = Math.cos(Date.now() * 0.001) * 15;
    earth.position.z = Math.sin(Date.now() * 0.001) * 15;
    
    // Update controls
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('Starting animation...');
// Start animation
animate(); 