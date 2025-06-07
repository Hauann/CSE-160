import * as THREE from 'three';
import { TextureLoader } from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create scene, camera, renderer
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load('../public/textures/sky.jpg', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
});
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI / 2;

// Load texture for at least one shape
const textureLoader = new TextureLoader();
const texture = textureLoader.load('../public/brick_diffuse.jpg');

// Arrays to hold objects
const shapes = [];

// Add 20+ shapes
for (let i = 0; i < 20; i++) {
    let mesh;
    const type = i % 3;

    const x = Math.random() * 20 - 10;
    const y = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;

    switch (type) {
        case 0: // Cube
            mesh = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
            );
            break;
        case 1: // Sphere
            mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.6, 32, 32),
                new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
            );
            break;
        case 2: // Cylinder
            mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
                new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
            );
            break;
    }

    mesh.position.set(x, y, z);
    shapes.push(mesh);
    scene.add(mesh);
}

// One textured cube
const texturedCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ map: texture })
);
texturedCube.position.set(-3, 0, 0);
scene.add(texturedCube);
shapes.push(texturedCube);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Point Light
const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
pointLight.position.set(0, 5, 5);
scene.add(pointLight);

// FIREFLY PARTICLES
const fireflyCount = 100;
const fireflyGeometry = new THREE.BufferGeometry();
const fireflyPositions = new Float32Array(fireflyCount * 3);

for (let i = 0; i < fireflyCount; i++) {
    fireflyPositions[i * 3 + 0] = (Math.random() - 0.5) * 20;
    fireflyPositions[i * 3 + 1] = Math.random() * 5 + 1;
    fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}

fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));

const fireflyMaterial = new THREE.PointsMaterial({
    color: 0xffffaa,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
scene.add(fireflies);

// Camera position
camera.position.z = 15;

// Animate a specific object
const animatedShape = shapes[0];

function animate() {
    // Rotate the animated shape
    if (animatedShape) {
        animatedShape.rotation.x += 0.01;
        animatedShape.rotation.y += 0.01;
    }
    // Animate fireflies
    const positions = fireflies.geometry.attributes.position.array;
    for (let i = 0; i < fireflyCount; i++) {
        positions[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001;
    }
    fireflies.geometry.attributes.position.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load .obj with .mtl material
const mtlLoader = new MTLLoader();
mtlLoader.setPath('../public/models/');

mtlLoader.load('Lowpoly_tree_sample.mtl', (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../public/models/');

    objLoader.load('Lowpoly_tree_sample.obj', (object) => {
        object.scale.set(0.5, 0.5, 0.5);
        object.position.set(3, 0, 0);
        scene.add(object);
    }, undefined, (error) => {
        console.error('Error loading OBJ model:', error);
    });
});