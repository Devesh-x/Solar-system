import * as THREE from 'three';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create three spheres
const sphere1 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
sphere1.position.x = -10;
scene.add(sphere1);

const sphere2 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
sphere2.position.x = 0;
scene.add(sphere2);

const sphere3 = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
sphere3.position.x = 10;
scene.add(sphere3);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    sphere1.rotation.y += 0.01;
    sphere2.rotation.y += 0.01;
    sphere3.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

animate(); 