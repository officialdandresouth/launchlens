/**
 * 3D Prism/Crystal background — inspired by drcmda's "Nextjs prism" sandbox.
 * Iridescent floating diamonds with fading particles.
 */

import * as THREE from 'https://esm.sh/three@0.162.0';

const CONFIG = {
    crystalCount: 5,
    particleCount: 120,
    rotationSpeed: 0.003,
    floatSpeed: 0.4,
    floatAmplitude: 0.3,
    mouseInfluence: 0.15,
};

let renderer, scene, camera, crystals, particleSystem, mouse, animId, container;
let clock;

function createCrystalMaterial(hueShift) {
    return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color().setHSL(hueShift, 0.3, 0.15),
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.95,
        thickness: 2.5,
        ior: 2.4,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        iridescenceThicknessRange: [100, 800],
        transparent: true,
        opacity: 0.9,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
    });
}

function createCrystal(index, total) {
    const size = 0.6 + Math.random() * 1.2;
    const geo = new THREE.OctahedronGeometry(size, 0);
    const mat = createCrystalMaterial(index / total);

    const mesh = new THREE.Mesh(geo, mat);

    const positions = [
        { x: 3.5, y: 0.5, z: -1 },
        { x: -3, y: -1.5, z: -2 },
        { x: 1, y: 2, z: -3 },
        { x: -1.5, y: 1, z: -1.5 },
        { x: 4, y: -2, z: -2.5 },
    ];

    const pos = positions[index % positions.length];
    mesh.position.set(pos.x, pos.y, pos.z);

    mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );

    mesh.userData = {
        rotSpeed: {
            x: (Math.random() - 0.5) * CONFIG.rotationSpeed * 2,
            y: (Math.random() - 0.5) * CONFIG.rotationSpeed * 2,
            z: (Math.random() - 0.5) * CONFIG.rotationSpeed * 2,
        },
        floatOffset: Math.random() * Math.PI * 2,
        fadeOffset: Math.random() * Math.PI * 2,
        baseY: pos.y,
        size,
    };

    return mesh;
}

function createParticles() {
    const count = CONFIG.particleCount;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 16;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
        opacities[i] = Math.random();
        phases[i] = Math.random() * Math.PI * 2;
        speeds[i] = 0.3 + Math.random() * 0.7;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

    const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.04,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.userData = { phases, speeds };
    return points;
}

function buildEnvMap() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.3, '#1a0a3e');
    gradient.addColorStop(0.5, '#0a1a4e');
    gradient.addColorStop(0.7, '#0a2a3e');
    gradient.addColorStop(1, '#0a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const spots = [
        { x: 60, y: 40, r: 30, color: 'rgba(100, 150, 255, 0.4)' },
        { x: 180, y: 120, r: 25, color: 'rgba(255, 100, 200, 0.3)' },
        { x: 100, y: 200, r: 35, color: 'rgba(50, 200, 255, 0.35)' },
    ];
    for (const s of spots) {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0, s.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
}

export function init(containerEl) {
    container = containerEl;
    mouse = { x: 0, y: 0 };
    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color('#050508');
    scene.environment = buildEnvMap();

    camera = new THREE.PerspectiveCamera(
        45, container.offsetWidth / container.offsetHeight, 0.1, 100
    );
    camera.position.set(0, 0, 7);

    // Lights
    scene.add(new THREE.AmbientLight(0x111122, 0.5));

    const keyLight = new THREE.SpotLight(0xffeedd, 30);
    keyLight.position.set(5, 5, 5);
    keyLight.angle = 0.6;
    keyLight.penumbra = 1;
    scene.add(keyLight);

    const blueLight = new THREE.PointLight(0x0EA5E9, 15, 20);
    blueLight.position.set(-4, 2, 3);
    scene.add(blueLight);

    const pinkLight = new THREE.PointLight(0xff3388, 10, 18);
    pinkLight.position.set(3, -3, 2);
    scene.add(pinkLight);

    const purpleLight = new THREE.PointLight(0x8844ff, 8, 15);
    purpleLight.position.set(-2, 4, -2);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00ffcc, 6, 12);
    cyanLight.position.set(4, 0, -1);
    scene.add(cyanLight);

    // Crystals
    crystals = [];
    for (let i = 0; i < CONFIG.crystalCount; i++) {
        const crystal = createCrystal(i, CONFIG.crystalCount);
        scene.add(crystal);
        crystals.push(crystal);
    }

    // Floating particles
    particleSystem = createParticles();
    scene.add(particleSystem);

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    animate();
}

function onResize() {
    if (!container) return;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    animId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Animate crystals — rotate, float, and fade in/out
    for (const crystal of crystals) {
        const ud = crystal.userData;

        crystal.rotation.x += ud.rotSpeed.x;
        crystal.rotation.y += ud.rotSpeed.y;
        crystal.rotation.z += ud.rotSpeed.z;

        crystal.position.y =
            ud.baseY +
            Math.sin(elapsed * CONFIG.floatSpeed + ud.floatOffset) *
                CONFIG.floatAmplitude;

        crystal.position.x +=
            (mouse.x * CONFIG.mouseInfluence - crystal.position.x) * 0.002;

        // Fade crystals in and out (slow breathing, 0.3 – 0.9 opacity)
        const fade = 0.6 + 0.3 * Math.sin(elapsed * 0.25 + ud.fadeOffset);
        crystal.material.opacity = fade;
    }

    // Animate particles — each fades on its own cycle
    if (particleSystem) {
        const posAttr = particleSystem.geometry.getAttribute('position');
        const { phases, speeds } = particleSystem.userData;
        const positions = posAttr.array;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            // Slow upward drift
            positions[i * 3 + 1] += 0.002 * speeds[i];

            // Wrap particles that float off the top
            if (positions[i * 3 + 1] > 6) {
                positions[i * 3 + 1] = -6;
                positions[i * 3] = (Math.random() - 0.5) * 16;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
            }
        }
        posAttr.needsUpdate = true;

        // Global particle opacity pulsing
        particleSystem.material.opacity =
            0.3 + 0.3 * Math.sin(elapsed * 0.5);
    }

    // Camera sway
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.01;
    camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.01;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

export function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('mousemove', onMouseMove);

    if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    if (crystals) {
        for (const c of crystals) {
            c.geometry.dispose();
            c.material.dispose();
        }
    }

    if (particleSystem) {
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
    }

    scene = null;
    camera = null;
    renderer = null;
    crystals = null;
    particleSystem = null;
}
