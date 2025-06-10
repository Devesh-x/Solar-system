import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Start with dark mode
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#solarSystem'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Camera positions for different views
const cameraViews = {
    top: { position: new THREE.Vector3(0, 50, 0), target: new THREE.Vector3(0, 0, 0) },
    side: { position: new THREE.Vector3(50, 0, 0), target: new THREE.Vector3(0, 0, 0) },
    front: { position: new THREE.Vector3(0, 0, 50), target: new THREE.Vector3(0, 0, 0) },
    followEarth: { position: new THREE.Vector3(0, 5, 20), target: new THREE.Vector3(0, 0, 0) },
    followJupiter: { position: new THREE.Vector3(0, 10, 30), target: new THREE.Vector3(0, 0, 0) },
    followSaturn: { position: new THREE.Vector3(0, 15, 35), target: new THREE.Vector3(0, 0, 0) }
};

// Enhanced Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Add multiple point lights for better planet illumination
const sunLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(sunLight);

// Add additional lights for better planet visibility
const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
frontLight.position.set(0, 0, 1);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
backLight.position.set(0, 0, -1);
scene.add(backLight);

// GUI
const gui = new GUI();

// Texture loader with error handling
const textureLoader = new THREE.TextureLoader();
const loadTexture = (url) => {
    return new Promise((resolve, reject) => {
        textureLoader.load(
            url,
            (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                resolve(texture);
            },
            undefined,
            (error) => {
                console.error(`Error loading texture ${url}:`, error);
                reject(error);
            }
        );
    });
};

// Planet data with local texture paths
const planetData = {
    sun: { 
        radius: 5, 
        texture: 'textures/sun.jpg',
        rotationSpeed: 0.004,
        emissive: true,
        emissiveIntensity: 1
    },
    mercury: { 
        radius: 0.4, 
        texture: 'textures/mercury.jpg',
        rotationSpeed: 0.004, 
        orbitRadius: 8, 
        orbitSpeed: 0.04,
        tilt: 0.034,
        metalness: 0.8,
        roughness: 0.4,
        initialAngle: 0
    },
    venus: { 
        radius: 0.9, 
        texture: 'textures/venus.jpg',
        rotationSpeed: 0.002, 
        orbitRadius: 11, 
        orbitSpeed: 0.015,
        tilt: 3.096,
        metalness: 0.3,
        roughness: 0.6,
        initialAngle: Math.PI / 4
    },
    earth: { 
        radius: 1, 
        texture: 'textures/earth.jpg',
        rotationSpeed: 0.02, 
        orbitRadius: 15, 
        orbitSpeed: 0.01,
        tilt: 0.409,
        metalness: 0.1,
        roughness: 0.7,
        initialAngle: Math.PI / 2
    },
    mars: { 
        radius: 0.5, 
        texture: 'textures/mars.jpg',
        rotationSpeed: 0.018, 
        orbitRadius: 19, 
        orbitSpeed: 0.008,
        tilt: 0.439,
        metalness: 0.2,
        roughness: 0.8,
        initialAngle: Math.PI * 3/4
    },
    jupiter: { 
        radius: 2.5, 
        texture: 'textures/jupiter.jpg',
        rotationSpeed: 0.04, 
        orbitRadius: 25, 
        orbitSpeed: 0.002,
        tilt: 0.054,
        metalness: 0.1,
        roughness: 0.6,
        initialAngle: Math.PI
    },
    saturn: { 
        radius: 2.2, 
        texture: 'textures/saturn.jpg',
        rotationSpeed: 0.038, 
        orbitRadius: 30, 
        orbitSpeed: 0.0009,
        tilt: 0.466,
        metalness: 0.2,
        roughness: 0.5,
        initialAngle: Math.PI * 5/4
    },
    uranus: { 
        radius: 1.8, 
        texture: 'textures/uranus.jpg',
        rotationSpeed: 0.03, 
        orbitRadius: 35, 
        orbitSpeed: 0.0004,
        tilt: 1.706,
        metalness: 0.3,
        roughness: 0.4,
        initialAngle: Math.PI * 3/2
    },
    neptune: { 
        radius: 1.8, 
        texture: 'textures/neptune.jpg',
        rotationSpeed: 0.032, 
        orbitRadius: 40, 
        orbitSpeed: 0.0001,
        tilt: 0.494,
        metalness: 0.4,
        roughness: 0.3,
        initialAngle: Math.PI * 7/4
    }
};

// Create planets
const planets = {};

// Create Sun
const sunGeometry = new THREE.SphereGeometry(planetData.sun.radius, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: planetData.sun.emissiveIntensity
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);
planets.sun = { mesh: sun, data: planetData.sun };

// Load sun texture
loadTexture(planetData.sun.texture)
    .then(texture => {
        sunMaterial.map = texture;
        sunMaterial.needsUpdate = true;
    })
    .catch(() => {
        console.log('Using fallback color for sun');
    });

// Create other planets
Object.entries(planetData).forEach(([name, data]) => {
    if (name === 'sun') return;

    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: data.roughness,
        metalness: data.metalness,
        emissive: 0x000000,
        emissiveIntensity: 0
    });
    const planet = new THREE.Mesh(geometry, material);
    
    // Set planet tilt
    planet.rotation.x = data.tilt;
    
    // Create orbit
    const orbitGeometry = new THREE.RingGeometry(data.orbitRadius - 0.1, data.orbitRadius + 0.1, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    // Position planet at its orbit radius
    planet.position.x = data.orbitRadius;
    scene.add(planet);
    planets[name] = { mesh: planet, data: data };

    // Load planet texture
    loadTexture(data.texture)
        .then(texture => {
            material.map = texture;
            material.needsUpdate = true;
        })
        .catch(() => {
            console.log(`Using fallback color for ${name}`);
        });
});

// Add stars
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1
});

const starsVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Function to smoothly move camera
function moveCameraToView(view) {
    const duration = 1000; // Duration in milliseconds
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPosition = view.position;
    const endTarget = view.target;
    const startTime = Date.now();

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(startPosition, endPosition, easeProgress);
        controls.target.lerpVectors(startTarget, endTarget, easeProgress);
        controls.update();

        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    animateCamera();
}

// GUI controls
const guiControls = {
    rotationSpeed: 1,
    orbitSpeed: 1,
    showOrbits: true,
    cameraDistance: 50,
    ambientLightIntensity: 0.3,
    sunLightIntensity: 2,
    cameraView: 'top',
    planets: {},
    isPaused: false,
    darkMode: true
};

// Create individual planet controls
Object.entries(planetData).forEach(([name, data]) => {
    if (name === 'sun') return;
    
    guiControls.planets[name] = {
        rotationSpeed: 1,
        orbitSpeed: 1
    };
});

// Create main folder
const mainFolder = gui.addFolder('Main Controls');
mainFolder.add(guiControls, 'rotationSpeed', 0, 2).name('Global Rotation Speed');
mainFolder.add(guiControls, 'orbitSpeed', 0, 2).name('Global Orbit Speed');
mainFolder.add(guiControls, 'showOrbits').name('Show Orbits').onChange((value) => {
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
            child.visible = value;
        }
    });
});
mainFolder.add(guiControls, 'cameraDistance', 20, 100).name('Camera Distance').onChange((value) => {
    camera.position.z = value;
});
mainFolder.add(guiControls, 'ambientLightIntensity', 0, 1).name('Ambient Light').onChange((value) => {
    ambientLight.intensity = value;
});
mainFolder.add(guiControls, 'sunLightIntensity', 0, 5).name('Sun Light').onChange((value) => {
    sunLight.intensity = value;
});

// Add pause/resume button
mainFolder.add(guiControls, 'isPaused').name('Pause Animation').onChange((value) => {
    if (value) {
        // Store the current time when paused
        clock.stop();
    } else {
        // Resume from the stored time
        clock.start();
    }
});

// Add dark mode toggle
mainFolder.add(guiControls, 'darkMode').name('Dark Mode').onChange((value) => {
    updateTheme(value);
});

// Add camera view options
mainFolder.add(guiControls, 'cameraView', {
    'Front View': 'front',
    'Top View': 'top',
    'Side View': 'side',
    'Follow Earth': 'followEarth',
    'Follow Jupiter': 'followJupiter',
    'Follow Saturn': 'followSaturn'
}).name('Camera View').onChange((value) => {
    moveCameraToView(cameraViews[value]);
});

// Create planet controls submenu
const planetControlsFolder = mainFolder.addFolder('Planet Controls');

// Add planet controls to the submenu
Object.entries(guiControls.planets).forEach(([name, controls]) => {
    const planetFolder = planetControlsFolder.addFolder(`${name.charAt(0).toUpperCase() + name.slice(1)}`);
    planetFolder.add(controls, 'rotationSpeed', 0, 2).name('Rotation');
    planetFolder.add(controls, 'orbitSpeed', 0, 2).name('Orbit');
});

// Minimize all folders initially
mainFolder.close();
planetControlsFolder.close();

// Set initial camera position to top view
camera.position.copy(cameraViews.top.position);
controls.target.copy(cameraViews.top.target);
controls.update();

// Animation
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Only update planet positions if not paused
    if (!guiControls.isPaused) {
        // Rotate sun
        sun.rotation.y += planetData.sun.rotationSpeed * guiControls.rotationSpeed;

        // Update planets
        Object.entries(planets).forEach(([name, planetObj]) => {
            if (name === 'sun') return;
            
            const { mesh, data } = planetObj;
            const planetControls = guiControls.planets[name];
            
            // Rotate planet with individual speed control
            mesh.rotation.y += data.rotationSpeed * guiControls.rotationSpeed * planetControls.rotationSpeed;
            
            // Update orbit position with initial angle and individual speed control
            const angle = elapsedTime * data.orbitSpeed * guiControls.orbitSpeed * planetControls.orbitSpeed + data.initialAngle;
            mesh.position.x = Math.cos(angle) * data.orbitRadius;
            mesh.position.z = Math.sin(angle) * data.orbitRadius;

            // Update follow camera positions
            if (name === 'earth') {
                cameraViews.followEarth.position.x = mesh.position.x;
                cameraViews.followEarth.position.z = mesh.position.z + 20;
                cameraViews.followEarth.target.copy(mesh.position);
            } else if (name === 'jupiter') {
                cameraViews.followJupiter.position.x = mesh.position.x;
                cameraViews.followJupiter.position.z = mesh.position.z + 30;
                cameraViews.followJupiter.target.copy(mesh.position);
            } else if (name === 'saturn') {
                cameraViews.followSaturn.position.x = mesh.position.x;
                cameraViews.followSaturn.position.z = mesh.position.z + 35;
                cameraViews.followSaturn.target.copy(mesh.position);
            }
        });
    }

    // Always update controls and render
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add label container
const labelContainer = document.createElement('div');
labelContainer.style.position = 'absolute';
labelContainer.style.top = '0';
labelContainer.style.left = '0';
labelContainer.style.pointerEvents = 'none';
labelContainer.style.zIndex = '1000';
document.body.appendChild(labelContainer);

// Create label element with enhanced styling
const label = document.createElement('div');
label.style.position = 'absolute';
label.style.background = 'rgba(0, 0, 0, 0.85)';
label.style.color = 'white';
label.style.padding = '12px 15px';
label.style.borderRadius = '8px';
label.style.fontFamily = 'Arial, sans-serif';
label.style.fontSize = '14px';
label.style.display = 'none';
label.style.pointerEvents = 'none';
label.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
label.style.opacity = '0';
label.style.transform = 'scale(0.95) translateY(10px)';
label.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
label.style.backdropFilter = 'blur(4px)';
label.style.border = '1px solid rgba(255, 255, 255, 0.1)';
label.style.minWidth = '200px';
labelContainer.appendChild(label);

// Create label header
const labelHeader = document.createElement('div');
labelHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
labelHeader.style.marginBottom = '8px';
labelHeader.style.paddingBottom = '8px';
label.appendChild(labelHeader);

// Create label content
const labelContent = document.createElement('div');
labelContent.style.display = 'grid';
labelContent.style.gridTemplateColumns = 'auto 1fr';
labelContent.style.gap = '8px';
labelContent.style.alignItems = 'center';
label.appendChild(labelContent);

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Planet information
const planetInfo = {
    mercury: { name: 'Mercury', type: 'Terrestrial Planet', diameter: '4,879 km', distance: '57.9 million km' },
    venus: { name: 'Venus', type: 'Terrestrial Planet', diameter: '12,104 km', distance: '108.2 million km' },
    earth: { name: 'Earth', type: 'Terrestrial Planet', diameter: '12,742 km', distance: '149.6 million km' },
    mars: { name: 'Mars', type: 'Terrestrial Planet', diameter: '6,779 km', distance: '227.9 million km' },
    jupiter: { name: 'Jupiter', type: 'Gas Giant', diameter: '139,820 km', distance: '778.5 million km' },
    saturn: { name: 'Saturn', type: 'Gas Giant', diameter: '116,460 km', distance: '1.4 billion km' },
    uranus: { name: 'Uranus', type: 'Ice Giant', diameter: '50,724 km', distance: '2.9 billion km' },
    neptune: { name: 'Neptune', type: 'Ice Giant', diameter: '49,244 km', distance: '4.5 billion km' }
};

// Function to update theme
function updateTheme(isDark) {
    if (isDark) {
        // Dark mode
        scene.background = new THREE.Color(0x000000);
        label.style.background = 'rgba(0, 0, 0, 0.85)';
        label.style.color = 'white';
        label.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        label.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    } else {
        // Light mode with galaxy gradient
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        const context = canvas.getContext('2d');
        
        // Create gradient
        const gradient = context.createLinearGradient(0, 0, 0, 2);
        gradient.addColorStop(0, '#1a1a2e');    // Deep space blue
        gradient.addColorStop(0.5, '#16213e');  // Galaxy purple
        gradient.addColorStop(1, '#0f3460');    // Cosmic dark blue
        
        // Fill with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Apply to scene
        scene.background = texture;
        
        // Update label styles for light mode
        label.style.background = 'rgba(255, 255, 255, 0.15)';
        label.style.color = '#fff';
        label.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        label.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
        label.style.backdropFilter = 'blur(8px)';
    }
    
    // Update orbit colors
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
            child.material.color.set(isDark ? 0xffffff : 0x000000);
            child.material.opacity = isDark ? 0.3 : 0.15;
        }
    });
    
    // Update stars
    if (stars) {
        stars.material.color.set(isDark ? 0xffffff : 0xffffff);
        stars.material.size = isDark ? 0.1 : 0.15;
    }
}

// Handle mouse move
window.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get all planet meshes
    const planetMeshes = Object.entries(planets)
        .filter(([name]) => name !== 'sun')
        .map(([_, planet]) => planet.mesh);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const planetMesh = intersects[0].object;
        const planetName = Object.entries(planets).find(([_, p]) => p.mesh === planetMesh)?.[0];

        if (planetName && planetInfo[planetName]) {
            const info = planetInfo[planetName];
            const position = planetMesh.position.clone();
            position.project(camera);

            // Convert to screen coordinates
            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = (position.y * -0.5 + 0.5) * window.innerHeight;

            // Update label header with theme-aware colors
            const textColor = guiControls.darkMode ? '#fff' : '#fff';
            const subTextColor = guiControls.darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.8)';
            
            labelHeader.innerHTML = `
                <div style="font-size: 18px; font-weight: bold; color: ${textColor}; margin-bottom: 4px;">
                    ${info.name}
                </div>
                <div style="font-size: 12px; color: ${subTextColor};">
                    ${info.type}
                </div>
            `;

            // Update label content with theme-aware colors
            labelContent.innerHTML = `
                <div style="color: ${subTextColor};">Diameter:</div>
                <div style="color: ${textColor};">${info.diameter}</div>
                <div style="color: ${subTextColor};">Distance:</div>
                <div style="color: ${textColor};">${info.distance}</div>
            `;

            // Position and show label with animation
            label.style.left = `${x + 15}px`;
            label.style.top = `${y - 15}px`;
            label.style.display = 'block';
            
            // Trigger animation
            requestAnimationFrame(() => {
                label.style.opacity = '1';
                label.style.transform = 'scale(1) translateY(0)';
            });
        }
    } else {
        // Hide label with animation
        label.style.opacity = '0';
        label.style.transform = 'scale(0.95) translateY(10px)';
        setTimeout(() => {
            if (label.style.opacity === '0') {
                label.style.display = 'none';
            }
        }, 300);
    }
});

// Handle window resize for label container
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelContainer.style.width = `${window.innerWidth}px`;
    labelContainer.style.height = `${window.innerHeight}px`;
});

// Initialize theme
updateTheme(guiControls.darkMode);

animate(); 