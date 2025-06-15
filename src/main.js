import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add stars
const createStars = () => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.1,
        transparent: true
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
    return stars;
};

const stars = createStars();

// Enhanced lighting system
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Sun light (point light)
const sunLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(sunLight);

// Add hemisphere light for better ambient lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemisphereLight);

// Add directional light for better shadows and highlights
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Load textures from local folder
const textures = {
    sun: textureLoader.load('./textures/sun.jpg'),
    mercury: textureLoader.load('./textures/mercury.jpg'),
    venus: textureLoader.load('./textures/venus.jpg'),
    earth: textureLoader.load('./textures/earth.jpg'),
    mars: textureLoader.load('./textures/mars.jpg'),
    jupiter: textureLoader.load('./textures/jupiter.jpg'),
    saturn: textureLoader.load('./textures/saturn.jpg'),
    uranus: textureLoader.load('./textures/uranus.jpg'),
    neptune: textureLoader.load('./textures/neptune.jpg')
};

// Create planets
const createPlanet = (radius, texture, distance, orbitSpeed, name) => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        map: texture,
        shininess: 30,
        specular: 0x333333
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.name = name;
    
    // Create a group to hold the planet and its orbit
    const group = new THREE.Group();
    group.add(planet);
    
    // Create orbit line
    const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    
    // Store orbit data
    planet.userData = {
        orbitSpeed: orbitSpeed,
        distance: distance,
        angle: Math.random() * Math.PI * 2, // Random starting position
        rotationSpeed: 0.01
    };
    
    scene.add(group);
    return { planet, group, orbit };
};

// Create all planets with their orbital speeds
const sun = createPlanet(5, textures.sun, 0, 0, 'Sun');
const mercury = createPlanet(0.4, textures.mercury, 10, 0.04, 'Mercury');
const venus = createPlanet(0.9, textures.venus, 15, 0.015, 'Venus');
const earth = createPlanet(1, textures.earth, 20, 0.01, 'Earth');
const mars = createPlanet(0.5, textures.mars, 25, 0.008, 'Mars');
const jupiter = createPlanet(2.5, textures.jupiter, 35, 0.002, 'Jupiter');
const saturn = createPlanet(2, textures.saturn, 40, 0.0009, 'Saturn');

// Add Saturn's rings
const ringGeometry = new THREE.RingGeometry(2.5, 4, 32);
const ringMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
    shininess: 30
});
const rings = new THREE.Mesh(ringGeometry, ringMaterial);
rings.rotation.x = Math.PI / 2;
saturn.planet.add(rings);

const uranus = createPlanet(1.5, textures.uranus, 45, 0.0004, 'Uranus');
const neptune = createPlanet(1.5, textures.neptune, 50, 0.0001, 'Neptune');

// Add camera views to state
const state = {
    isPaused: false,
    timeScale: 1.0,
    darkMode: true,
    lighting: {
        ambient: 0.5,
        sun: 2.0,
        hemisphere: 0.6,
        directional: 0.5
    },
    cameraView: 'default'
};

// Camera view positions
const cameraViews = {
    default: {
        position: new THREE.Vector3(0, 50, 100),
        target: new THREE.Vector3(0, 0, 0),
        duration: 1000
    },
    top: {
        position: new THREE.Vector3(0, 100, 0),
        target: new THREE.Vector3(0, 0, 0),
        duration: 1000
    },
    side: {
        position: new THREE.Vector3(100, 0, 0),
        target: new THREE.Vector3(0, 0, 0),
        duration: 1000
    },
    close: {
        position: new THREE.Vector3(0, 20, 30),
        target: new THREE.Vector3(0, 0, 0),
        duration: 1000
    },
    far: {
        position: new THREE.Vector3(0, 100, 200),
        target: new THREE.Vector3(0, 0, 0),
        duration: 1000
    }
};

// Function to animate camera movement
const animateCamera = (targetPosition, targetLookAt, duration) => {
    const startPosition = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = Date.now();

    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Interpolate position
        camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
        
        // Interpolate look-at target
        controls.target.lerpVectors(startLookAt, targetLookAt, easeProgress);
        
        controls.update();

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    animate();
};

// Function to update lighting based on mode
const updateLighting = (isDark) => {
    if (isDark) {
        // Dark mode
        scene.background = new THREE.Color(0x000000);
        stars.material.size = 0.2;
        stars.material.color.set(0xFFFFFF);
        
        // Adjust lights for dark mode
        ambientLight.intensity = 0.2;
        sunLight.intensity = 1.5;
        hemisphereLight.intensity = 0.3;
        directionalLight.intensity = 0.3;
        
        // Update orbit lines
        [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].forEach(({ orbit }) => {
            orbit.material.opacity = 0.2;
            orbit.material.color.set(0x666666);
        });
    } else {
        // Light mode - Ice blue gradient
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        const context = canvas.getContext('2d');
        
        // Create gradient with ice blue colors
        const gradient = context.createLinearGradient(0, 0, 0, 2);
        gradient.addColorStop(0, '#E0F7FF');    // Light ice blue
        gradient.addColorStop(0.5, '#B3E5FC');  // Medium ice blue
        gradient.addColorStop(1, '#81D4FA');    // Deep ice blue
        
        // Fill with gradient
        context.fillStyle = gradient;
        context.fillRect(0, 0, 2, 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Apply texture to scene background
        scene.background = texture;
        
        // Adjust stars for ice blue theme
        stars.material.size = 0.12;
        stars.material.color.set(0xFFFFFF);
        
        // Adjust lights for ice blue mode
        ambientLight.intensity = 0.45;
        sunLight.intensity = 1.9;
        hemisphereLight.intensity = 0.55;
        directionalLight.intensity = 0.45;
        
        // Update orbit lines to black in light mode
        [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].forEach(({ orbit }) => {
            orbit.material.opacity = 0.3;
            orbit.material.color.set(0x000000);
        });
    }
};

// Create tooltip
const tooltip = document.createElement('div');
tooltip.style.position = 'fixed';
tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
tooltip.style.color = 'white';
tooltip.style.padding = '10px';
tooltip.style.borderRadius = '5px';
tooltip.style.fontFamily = 'Arial, sans-serif';
tooltip.style.fontSize = '14px';
tooltip.style.pointerEvents = 'none';
tooltip.style.zIndex = '1000';
tooltip.style.display = 'none';
tooltip.style.maxWidth = '300px';
tooltip.style.lineHeight = '1.4';
document.body.appendChild(tooltip);

// Planet information
const planetInfo = {
    mercury: {
        name: 'Mercury',
        diameter: '4,879 km',
        distance: '57.9 million km',
        orbitalPeriod: '88 days',
        surfaceTemp: '-180°C to 430°C',
        description: 'The smallest and innermost planet in the Solar System. It has no atmosphere and is heavily cratered.'
    },
    venus: {
        name: 'Venus',
        diameter: '12,104 km',
        distance: '108.2 million km',
        orbitalPeriod: '225 days',
        surfaceTemp: '462°C',
        description: 'The hottest planet in our solar system, with a thick atmosphere of carbon dioxide and sulfuric acid clouds.'
    },
    earth: {
        name: 'Earth',
        diameter: '12,742 km',
        distance: '149.6 million km',
        orbitalPeriod: '365.25 days',
        surfaceTemp: '-88°C to 58°C',
        description: 'The only known planet to harbor life. It has liquid water on its surface and a protective atmosphere.'
    },
    mars: {
        name: 'Mars',
        diameter: '6,779 km',
        distance: '227.9 million km',
        orbitalPeriod: '687 days',
        surfaceTemp: '-140°C to 20°C',
        description: 'Known as the Red Planet due to iron oxide on its surface. It has the largest dust storms in the solar system.'
    },
    jupiter: {
        name: 'Jupiter',
        diameter: '139,820 km',
        distance: '778.5 million km',
        orbitalPeriod: '11.9 years',
        surfaceTemp: '-110°C',
        description: 'The largest planet in our solar system. It has a Great Red Spot, a storm that has raged for over 300 years.'
    },
    saturn: {
        name: 'Saturn',
        diameter: '116,460 km',
        distance: '1.4 billion km',
        orbitalPeriod: '29.5 years',
        surfaceTemp: '-178°C',
        description: 'Famous for its spectacular ring system made of ice and rock particles. It has the lowest density of all planets.'
    },
    uranus: {
        name: 'Uranus',
        diameter: '50,724 km',
        distance: '2.9 billion km',
        orbitalPeriod: '84 years',
        surfaceTemp: '-224°C',
        description: 'The first planet discovered with a telescope. It rotates on its side with an axial tilt of 98 degrees.'
    },
    neptune: {
        name: 'Neptune',
        diameter: '49,244 km',
        distance: '4.5 billion km',
        orbitalPeriod: '165 years',
        surfaceTemp: '-214°C',
        description: 'The windiest planet with winds reaching 2,100 km/h. It has a Great Dark Spot similar to Jupiter\'s Red Spot.'
    }
};

// Raycaster for planet selection
const raycaster = new THREE.Raycaster();

// Update mouse move handler
window.addEventListener('mousemove', (event) => {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        const planetName = object.name.toLowerCase();
        
        if (planetInfo[planetName]) {
            const info = planetInfo[planetName];
            tooltip.innerHTML = `
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${info.name}</div>
                <div style="margin-bottom: 4px;">Diameter: ${info.diameter}</div>
                <div style="margin-bottom: 4px;">Distance from Sun: ${info.distance}</div>
                <div style="margin-bottom: 4px;">Orbital Period: ${info.orbitalPeriod}</div>
                <div style="margin-bottom: 8px;">Surface Temperature: ${info.surfaceTemp}</div>
                <div style="font-style: italic;">${info.description}</div>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        }
    } else {
        tooltip.style.display = 'none';
    }
});

// Handle click for camera movement
window.addEventListener('click', (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.name) {
            const targetPosition = new THREE.Vector3();
            object.getWorldPosition(targetPosition);
            
            // Animate camera to new position
            const startPosition = camera.position.clone();
            const startTime = Date.now();
            const duration = 1000; // 1 second animation

            function animateCamera() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease in-out function
                const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                camera.position.lerpVectors(startPosition, targetPosition.multiplyScalar(1.5), easeProgress);
                controls.target.copy(targetPosition);
                
                if (progress < 1) {
                    requestAnimationFrame(animateCamera);
                }
            }
            
            animateCamera();
        }
    }
});

// Create control panel
const createControlPanel = () => {
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    panel.style.padding = '12px';
    panel.style.borderRadius = '8px';
    panel.style.color = 'white';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.zIndex = '1000';
    panel.style.width = '180px';
    panel.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    panel.style.transition = 'all 0.3s ease';

    // Create collapsible sections
    const createSection = (title, isOpen = false) => {
        const section = document.createElement('div');
        section.style.marginBottom = '8px';
        section.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        section.style.paddingBottom = '8px';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.cursor = 'pointer';
        header.style.padding = '4px 0';
        header.style.fontSize = '13px';
        header.style.fontWeight = 'bold';
        header.style.color = '#E0E0E0';

        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;

        const arrow = document.createElement('span');
        arrow.textContent = isOpen ? '▼' : '▶';
        arrow.style.fontSize = '10px';
        arrow.style.transition = 'transform 0.3s ease';

        header.appendChild(titleSpan);
        header.appendChild(arrow);

        const content = document.createElement('div');
        content.style.display = isOpen ? 'block' : 'none';
        content.style.marginTop = '8px';

        header.addEventListener('click', () => {
            const isContentVisible = content.style.display === 'block';
            content.style.display = isContentVisible ? 'none' : 'block';
            arrow.textContent = isContentVisible ? '▶' : '▼';
        });

        section.appendChild(header);
        section.appendChild(content);
        return { section, content };
    };

    // Camera Views Section
    const cameraSection = createSection('Camera Views', true);
    const views = [
        { id: 'default', label: 'Default' },
        { id: 'top', label: 'Top' },
        { id: 'side', label: 'Side' },
        { id: 'close', label: 'Close' },
        { id: 'far', label: 'Far' }
    ];

    views.forEach(view => {
        const button = document.createElement('button');
        button.textContent = view.label;
        button.style.width = '100%';
        button.style.padding = '6px';
        button.style.margin = '2px 0';
        button.style.backgroundColor = state.cameraView === view.id ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';
        button.style.fontSize = '12px';

        button.addEventListener('mouseover', () => {
            if (state.cameraView !== view.id) {
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }
        });

        button.addEventListener('mouseout', () => {
            if (state.cameraView !== view.id) {
                button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        button.addEventListener('click', () => {
            views.forEach(v => {
                const btn = cameraSection.content.querySelector(`button[data-view="${v.id}"]`);
                if (btn) {
                    btn.style.backgroundColor = v.id === view.id ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)';
                }
            });

            const viewConfig = cameraViews[view.id];
            animateCamera(viewConfig.position, viewConfig.target, viewConfig.duration);
            state.cameraView = view.id;
        });

        button.setAttribute('data-view', view.id);
        cameraSection.content.appendChild(button);
    });

    // Dark Mode Section
    const darkModeSection = createSection('Display', true);
    const darkModeContainer = document.createElement('div');
    darkModeContainer.style.display = 'flex';
    darkModeContainer.style.alignItems = 'center';
    darkModeContainer.style.justifyContent = 'space-between';
    darkModeContainer.style.padding = '4px 0';

    const darkModeLabel = document.createElement('label');
    darkModeLabel.textContent = 'Dark Mode';
    darkModeLabel.style.fontSize = '12px';
    darkModeLabel.style.cursor = 'pointer';
    darkModeLabel.style.display = 'flex';
    darkModeLabel.style.alignItems = 'center';
    darkModeLabel.style.gap = '8px';

    const darkModeToggle = document.createElement('div');
    darkModeToggle.style.width = '32px';
    darkModeToggle.style.height = '16px';
    darkModeToggle.style.backgroundColor = state.darkMode ? '#2196F3' : '#4CAF50';
    darkModeToggle.style.borderRadius = '8px';
    darkModeToggle.style.position = 'relative';
    darkModeToggle.style.transition = 'background-color 0.3s ease';
    darkModeToggle.style.overflow = 'hidden';

    const toggleButton = document.createElement('div');
    toggleButton.style.width = '12px';
    toggleButton.style.height = '12px';
    toggleButton.style.backgroundColor = 'white';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '2px';
    toggleButton.style.left = state.darkMode ? '18px' : '2px';
    toggleButton.style.transition = 'all 0.3s ease';
    toggleButton.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';

    darkModeToggle.appendChild(toggleButton);
    darkModeLabel.appendChild(darkModeToggle);

    darkModeContainer.addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        updateLighting(state.darkMode);
        
        toggleButton.style.left = state.darkMode ? '18px' : '2px';
        darkModeToggle.style.backgroundColor = state.darkMode ? '#2196F3' : '#4CAF50';
    });

    darkModeContainer.appendChild(darkModeLabel);
    darkModeSection.content.appendChild(darkModeContainer);

    // Planet Speeds Section
    const speedSection = createSection('Planet Speeds', false);
    const planets = [
        { name: 'Mercury', object: mercury },
        { name: 'Venus', object: venus },
        { name: 'Earth', object: earth },
        { name: 'Mars', object: mars },
        { name: 'Jupiter', object: jupiter },
        { name: 'Saturn', object: saturn },
        { name: 'Uranus', object: uranus },
        { name: 'Neptune', object: neptune }
    ];

    planets.forEach(({ name, object }) => {
        const container = document.createElement('div');
        container.style.marginBottom = '6px';

        const label = document.createElement('div');
        label.textContent = name;
        label.style.fontSize = '11px';
        label.style.marginBottom = '2px';
        label.style.color = '#E0E0E0';
        container.appendChild(label);

        const sliderContainer = document.createElement('div');
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        sliderContainer.style.gap = '8px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '0.1';
        slider.step = '0.001';
        slider.value = object.planet.userData.orbitSpeed;
        slider.style.flex = '1';
        slider.style.height = '4px';
        slider.style.webkitAppearance = 'none';
        slider.style.background = 'rgba(255, 255, 255, 0.1)';
        slider.style.borderRadius = '2px';
        slider.style.outline = 'none';

        // Custom slider thumb
        slider.style.webkitAppearance = 'none';
        slider.style.appearance = 'none';
        slider.style.width = '100%';
        slider.style.height = '4px';
        slider.style.background = 'rgba(255, 255, 255, 0.1)';
        slider.style.borderRadius = '2px';
        slider.style.outline = 'none';

        // Style the thumb
        slider.style.background = `
            linear-gradient(to right, #4CAF50 0%, #4CAF50 ${(slider.value / 0.1) * 100}%, 
            rgba(255, 255, 255, 0.1) ${(slider.value / 0.1) * 100}%, rgba(255, 255, 255, 0.1) 100%)
        `;

        const value = document.createElement('span');
        value.textContent = slider.value;
        value.style.fontSize = '11px';
        value.style.minWidth = '40px';
        value.style.textAlign = 'right';
        value.style.color = '#E0E0E0';

        slider.addEventListener('input', (e) => {
            const newSpeed = parseFloat(e.target.value);
            object.planet.userData.orbitSpeed = newSpeed;
            value.textContent = newSpeed.toFixed(3);
            
            // Update slider background
            slider.style.background = `
                linear-gradient(to right, #4CAF50 0%, #4CAF50 ${(newSpeed / 0.1) * 100}%, 
                rgba(255, 255, 255, 0.1) ${(newSpeed / 0.1) * 100}%, rgba(255, 255, 255, 0.1) 100%)
            `;
        });

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(value);
        container.appendChild(sliderContainer);
        speedSection.content.appendChild(container);
    });

    // Add sections to panel
    panel.appendChild(cameraSection.section);
    panel.appendChild(darkModeSection.section);
    panel.appendChild(speedSection.section);

    document.body.appendChild(panel);
};

// Create the control panel
createControlPanel();

// Initialize lighting with dark mode
updateLighting(state.darkMode);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!state.isPaused) {
        // Update planet positions and rotations
        [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].forEach(({ planet, group }) => {
            // Update orbit angle
            planet.userData.angle += planet.userData.orbitSpeed * state.timeScale;
            
            // Calculate new position
            const x = Math.cos(planet.userData.angle) * planet.userData.distance;
            const z = Math.sin(planet.userData.angle) * planet.userData.distance;
            
            // Update group position
            group.position.x = x;
            group.position.z = z;
            
            // Rotate planet
            planet.rotation.y += planet.userData.rotationSpeed * state.timeScale;
        });
        
        // Rotate sun
        sun.planet.rotation.y += 0.001 * state.timeScale;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 