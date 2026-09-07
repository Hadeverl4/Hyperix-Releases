/**
 * Hyperix Interactive Three.js 3D Background
 * Features:
 * - Floating isometric voxel instances (Minecraft-inspired modular cubes)
 * - Luminous wireframe bevel edges and glowing inner cores
 * - Dynamic dual-color lighting tracking pointer position
 * - Parallax camera inertia with smooth lerp
 * - Ambient starfield / energy particle dust
 * - Responsive resize handling and tab visibility optimization
 */

(function () {
  'use strict';

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Check WebGL availability
  function isWebGLAvailable() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!window.THREE || !isWebGLAvailable()) {
    if (canvas) canvas.style.display = 'none';
    return;
  }

  const THREE = window.THREE;

  // Setup Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070913, 0.035);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 18);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    precision: 'mediump'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x1a2142, 1.4);
  scene.add(ambientLight);

  // Cyan PointLight (representing technology & safety)
  const cyanLight = new THREE.PointLight(0x00f0ff, 2.6, 32);
  cyanLight.position.set(8, 6, 8);
  scene.add(cyanLight);

  // Neon Indigo/Purple PointLight (representing Minecraft obsidian & hyper energy)
  const purpleLight = new THREE.PointLight(0x818cf8, 3.2, 35);
  purpleLight.position.set(-8, -6, 6);
  scene.add(purpleLight);

  // Floating Voxels Group
  const voxelsGroup = new THREE.Group();
  scene.add(voxelsGroup);

  // Minecraft-inspired Cube Configurations
  // Each cube has a glass outer shell + glowing wireframe edges + inner core
  const cubeCount = window.innerWidth < 768 ? 14 : 26;
  const cubes = [];

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const edgesGeo = new THREE.EdgesGeometry(boxGeo);

  // Palette of glowing wireframe colors
  const edgeColors = [0x6366f1, 0x38bdf8, 0x818cf8, 0xa855f7, 0x06b6d4];

  for (let i = 0; i < cubeCount; i++) {
    const cubeHolder = new THREE.Group();

    // Scale variation (modular instances)
    const scale = 0.55 + Math.random() * 0.95;
    cubeHolder.scale.set(scale, scale, scale);

    // Glassy Translucent Face Material
    const faceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0d1430,
      transparent: true,
      opacity: 0.38,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    });

    const faceMesh = new THREE.Mesh(boxGeo, faceMaterial);
    cubeHolder.add(faceMesh);

    // Luminous Neon Wireframe Edges
    const edgeColor = edgeColors[i % edgeColors.length];
    const edgeMat = new THREE.LineBasicMaterial({
      color: edgeColor,
      transparent: true,
      opacity: 0.65,
      linewidth: 1.5
    });
    const lineEdges = new THREE.LineSegments(edgesGeo, edgeMat);
    cubeHolder.add(lineEdges);

    // Occasional glowing core block inside
    if (i % 3 === 0) {
      const coreScale = 0.38;
      const coreGeo = new THREE.BoxGeometry(coreScale, coreScale, coreScale);
      const coreMat = new THREE.MeshBasicMaterial({
        color: edgeColor,
        wireframe: false,
        transparent: true,
        opacity: 0.75
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      cubeHolder.add(coreMesh);
    }

    // Position spread in a beautiful volumetric field
    const spreadX = window.innerWidth < 768 ? 12 : 26;
    const spreadY = 16;
    const spreadZ = 12;

    cubeHolder.position.x = (Math.random() - 0.5) * spreadX;
    cubeHolder.position.y = (Math.random() - 0.5) * spreadY;
    cubeHolder.position.z = (Math.random() - 0.5) * spreadZ - 2;

    // Rotation Speeds
    const rotSpeed = {
      x: (Math.random() - 0.5) * 0.006,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.005
    };

    // Float amplitude & frequency
    const floatParams = {
      initialY: cubeHolder.position.y,
      initialX: cubeHolder.position.x,
      speed: 0.4 + Math.random() * 0.7,
      amplitudeY: 0.4 + Math.random() * 0.8,
      amplitudeX: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2
    };

    voxelsGroup.add(cubeHolder);
    cubes.push({ holder: cubeHolder, rotSpeed, floatParams });
  }

  // Floating Energy Starfield Particles
  const particleCount = window.innerWidth < 768 ? 240 : 500;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let p = 0; p < particleCount; p++) {
    particlePositions[p * 3] = (Math.random() - 0.5) * 35;
    particlePositions[p * 3 + 1] = (Math.random() - 0.5) * 25;
    particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 20;
    particleScales[p] = Math.random() * 1.5 + 0.5;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  // Particle Material
  const particleMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.09,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse Parallax & Target Positions
  let mouseX = 0;
  let mouseY = 0;
  let targetCameraX = 0;
  let targetCameraY = 0;

  function onMouseMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    mouseX = x;
    mouseY = y;

    targetCameraX = x * 2.2;
    targetCameraY = y * 1.4;

    // Shift point lights gently toward mouse
    cyanLight.position.x = 8 + x * 4;
    cyanLight.position.y = 6 + y * 4;
    purpleLight.position.x = -8 - x * 4;
    purpleLight.position.y = -6 - y * 4;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Handle Scroll Parallax
  let scrollY = 0;
  window.addEventListener(
    'scroll',
    () => {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
    },
    { passive: true }
  );

  // Resize Handler
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onWindowResize, 100);
  });

  // Animation Loop with Clock
  const clock = new THREE.Clock();
  let isRunning = true;

  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    if (isRunning) clock.getDelta(); // reset delta so objects don't jump
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!isRunning) return;

    const elapsedTime = clock.getElapsedTime();

    // Smooth Camera Lerp
    camera.position.x += (targetCameraX - camera.position.x) * 0.04;
    camera.position.y += (targetCameraY - camera.position.y - (scrollY * 0.004)) * 0.04;
    camera.lookAt(0, 0, 0);

    // Rotate Entire Voxel System slowly
    voxelsGroup.rotation.y = elapsedTime * 0.035;
    voxelsGroup.rotation.x = Math.sin(elapsedTime * 0.02) * 0.06;

    // Animate Each Cube
    for (let i = 0; i < cubes.length; i++) {
      const { holder, rotSpeed, floatParams } = cubes[i];

      holder.rotation.x += rotSpeed.x;
      holder.rotation.y += rotSpeed.y;
      holder.rotation.z += rotSpeed.z;

      // Floating sine wave animation
      const t = elapsedTime * floatParams.speed + floatParams.phase;
      holder.position.y = floatParams.initialY + Math.sin(t) * floatParams.amplitudeY;
      holder.position.x = floatParams.initialX + Math.cos(t * 0.7) * floatParams.amplitudeX;
    }

    // Particle field gentle drift
    particles.rotation.y = elapsedTime * 0.015;
    particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.03;

    renderer.render(scene, camera);
  }

  animate();
})();
