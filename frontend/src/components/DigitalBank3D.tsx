import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface DigitalBank3DProps {
  className?: string;
}

export const DigitalBank3D: React.FC<DigitalBank3DProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 640;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.028);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Elevated isometric 3/4 viewpoint matching reference
    camera.position.set(5.2, 4.4, 7.6);
    camera.lookAt(0, -0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // 2. Root Bank Hub Group
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, -0.2, 0);
    scene.add(rootGroup);

    // Materials Palette
    const darkMetallicNavy = new THREE.MeshStandardMaterial({
      color: 0x05132d,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x020d24,
      emissiveIntensity: 0.6,
    });

    const blueChamberMat = new THREE.MeshStandardMaterial({
      color: 0x0a224a,
      roughness: 0.18,
      metalness: 0.85,
      emissive: 0x04193d,
      emissiveIntensity: 0.7,
    });

    const neonCyanLine = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const neonBlueLine = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    const neonPurpleLine = new THREE.LineBasicMaterial({ color: 0xa855f7, linewidth: 2 });
    const neonPinkLine = new THREE.LineBasicMaterial({ color: 0xec4899, linewidth: 2 });

    // ==========================================
    // 3. MULTI-TIERED HOLOGRAPHIC FOUNDATION
    // ==========================================
    // Tier 3: Bottom Large Technological Base (Octagonal Foundation)
    const baseGeo = new THREE.CylinderGeometry(3.8, 4.1, 0.35, 8);
    const baseMesh = new THREE.Mesh(baseGeo, darkMetallicNavy);
    baseMesh.position.set(0, -1.85, 0);
    rootGroup.add(baseMesh);

    const baseEdges = new THREE.LineSegments(new THREE.EdgesGeometry(baseGeo), neonCyanLine);
    baseMesh.add(baseEdges);

    // Floor Glowing Holographic Circuit Rings
    const floorRingGeo = new THREE.RingGeometry(4.2, 5.2, 64);
    const floorRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const floorRing = new THREE.Mesh(floorRingGeo, floorRingMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.set(0, -2.01, 0);
    rootGroup.add(floorRing);

    // Inner Concentric Neon Ground Ticks
    const groundTicksGeo = new THREE.RingGeometry(2.6, 2.65, 64);
    const groundTicksMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const groundTicks = new THREE.Mesh(groundTicksGeo, groundTicksMat);
    groundTicks.rotation.x = Math.PI / 2;
    groundTicks.position.set(0, -1.66, 0);
    rootGroup.add(groundTicks);

    // Tier 2: Intermediate Hexagonal Podium
    const tier2Geo = new THREE.CylinderGeometry(3.0, 3.25, 0.3, 8);
    const tier2Mesh = new THREE.Mesh(tier2Geo, darkMetallicNavy);
    tier2Mesh.position.set(0, -1.52, 0);
    rootGroup.add(tier2Mesh);

    const tier2Edges = new THREE.LineSegments(new THREE.EdgesGeometry(tier2Geo), neonBlueLine);
    tier2Mesh.add(tier2Edges);

    // Tier 1: Stylobate Platform (Directly beneath Bank Columns)
    const stylobateGeo = new THREE.BoxGeometry(3.4, 0.24, 2.7);
    const stylobateMesh = new THREE.Mesh(stylobateGeo, blueChamberMat);
    stylobateMesh.position.set(0, -1.24, 0.1);
    rootGroup.add(stylobateMesh);

    const styloEdges = new THREE.LineSegments(new THREE.EdgesGeometry(stylobateGeo), neonCyanLine);
    stylobateMesh.add(styloEdges);

    // Front Entrance Steps (3 Layered Neon Stairs)
    for (let s = 0; s < 3; s++) {
      const stepWidth = 1.4 - s * 0.15;
      const stepGeo = new THREE.BoxGeometry(stepWidth, 0.08, 0.22);
      const step = new THREE.Mesh(stepGeo, blueChamberMat);
      step.position.set(0, -1.4 + s * 0.08, 1.5 - s * 0.18);
      rootGroup.add(step);

      const stepEdge = new THREE.LineSegments(new THREE.EdgesGeometry(stepGeo), neonCyanLine);
      step.add(stepEdge);
    }

    // ==========================================
    // 4. FUTURISTIC NEO-CLASSICAL BANK HEADQUARTERS
    // ==========================================
    // Main Chamber Box
    const chamberGeo = new THREE.BoxGeometry(2.7, 1.7, 1.9);
    const chamberMesh = new THREE.Mesh(chamberGeo, blueChamberMat);
    chamberMesh.position.set(0, -0.32, -0.15);
    rootGroup.add(chamberMesh);

    const chamberEdges = new THREE.LineSegments(new THREE.EdgesGeometry(chamberGeo), neonBlueLine);
    chamberMesh.add(chamberEdges);

    // Arched Entrance Portal with Volumetric Luminescence
    const portalFrameGeo = new THREE.BoxGeometry(0.95, 1.25, 0.1);
    const portalFrameMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9,
    });
    const portalFrame = new THREE.Mesh(portalFrameGeo, portalFrameMat);
    portalFrame.position.set(0, -0.52, 0.82);
    rootGroup.add(portalFrame);

    // Inner Radiant Gateway
    const portalInnerGeo = new THREE.PlaneGeometry(0.78, 1.05);
    const portalInnerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
    });
    const portalInner = new THREE.Mesh(portalInnerGeo, portalInnerMat);
    portalInner.position.set(0, -0.52, 0.86);
    rootGroup.add(portalInner);

    // Floating Holographic Security Shield in Doorway
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 0.22);
    shieldShape.lineTo(0.16, 0.14);
    shieldShape.lineTo(0.13, -0.11);
    shieldShape.lineTo(0, -0.24);
    shieldShape.lineTo(-0.13, -0.11);
    shieldShape.lineTo(-0.16, 0.14);
    shieldShape.closePath();
    const shieldGeo = new THREE.ShapeGeometry(shieldShape);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const portalShield = new THREE.Mesh(shieldGeo, shieldMat);
    portalShield.position.set(0, -0.52, 0.92);
    rootGroup.add(portalShield);

    // 6 Classical Illuminated Fluted Columns
    const columnGroup = new THREE.Group();
    const colXPositions = [-1.22, -0.73, -0.24, 0.24, 0.73, 1.22];

    colXPositions.forEach((posX) => {
      // Column Shaft
      const colGeo = new THREE.CylinderGeometry(0.085, 0.085, 1.62, 24);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        emissive: 0x0284c7,
        emissiveIntensity: 0.85,
        roughness: 0.12,
        metalness: 0.92,
      });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(posX, -0.34, 0.94);
      columnGroup.add(col);

      // Capital Ring (Top)
      const capGeo = new THREE.CylinderGeometry(0.13, 0.09, 0.08, 16);
      const capMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(posX, 0.49, 0.94);
      columnGroup.add(cap);

      // Base Ring (Bottom)
      const baseColGeo = new THREE.CylinderGeometry(0.09, 0.14, 0.08, 16);
      const baseCol = new THREE.Mesh(baseColGeo, capMat);
      baseCol.position.set(posX, -1.13, 0.94);
      columnGroup.add(baseCol);
    });
    rootGroup.add(columnGroup);

    // Entablature (Horizontal Beam Above Columns)
    const entablatureGeo = new THREE.BoxGeometry(3.1, 0.34, 2.4);
    const entablature = new THREE.Mesh(entablatureGeo, blueChamberMat);
    entablature.position.set(0, 0.65, 0.05);
    rootGroup.add(entablature);

    const entEdges = new THREE.LineSegments(new THREE.EdgesGeometry(entablatureGeo), neonCyanLine);
    entablature.add(entEdges);

    // High-Resolution Glowing Neon "BANK" Signage Across Front Facade
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d')!;
    signCtx.fillStyle = '#061a38';
    signCtx.fillRect(0, 0, 512, 128);
    signCtx.font = 'bold 76px "Plus Jakarta Sans", sans-serif';
    signCtx.fillStyle = '#38bdf8';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.shadowColor = '#00f0ff';
    signCtx.shadowBlur = 28;
    signCtx.fillText('BANK', 256, 64);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(1.45, 0.38);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture, transparent: true });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 0.65, 1.26);
    rootGroup.add(signMesh);

    // Triangular Pediment / Gable Roof
    const pedimentShape = new THREE.Shape();
    pedimentShape.moveTo(-1.62, 0);
    pedimentShape.lineTo(0, 1.1);
    pedimentShape.lineTo(1.62, 0);
    pedimentShape.closePath();

    const pedimentExtrude = { depth: 2.35, bevelEnabled: false };
    const pedimentGeo = new THREE.ExtrudeGeometry(pedimentShape, pedimentExtrude);
    const pedimentMat = new THREE.MeshStandardMaterial({
      color: 0x092147,
      roughness: 0.22,
      metalness: 0.88,
      emissive: 0x03183b,
      emissiveIntensity: 0.75,
    });
    const pediment = new THREE.Mesh(pedimentGeo, pedimentMat);
    pediment.position.set(0, 0.82, -1.15);
    rootGroup.add(pediment);

    // Neon Cyan Trim along Pediment Triangle Edge
    const trimPoints = [
      new THREE.Vector3(-1.62, 0.82, 1.21),
      new THREE.Vector3(0, 1.92, 1.21),
      new THREE.Vector3(1.62, 0.82, 1.21),
      new THREE.Vector3(-1.62, 0.82, 1.21),
    ];
    const trimGeo = new THREE.BufferGeometry().setFromPoints(trimPoints);
    const trimLine = new THREE.Line(trimGeo, neonCyanLine);
    rootGroup.add(trimLine);

    // Glowing Circular Rosette Insignia on Gable Facade
    const rosetteGeo = new THREE.CircleGeometry(0.26, 32);
    const rosetteMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const rosette = new THREE.Mesh(rosetteGeo, rosetteMat);
    rosette.position.set(0, 1.24, 1.22);
    rootGroup.add(rosette);

    // ==========================================
    // 5. RADIATING ISOMETRIC CIRCUIT TRACES & CUSTOMER TELEMETRY NODES
    // ==========================================
    const circuitsGroup = new THREE.Group();
    rootGroup.add(circuitsGroup);

    interface BranchNode {
      path: THREE.Vector3[];
      pedestalPos: THREE.Vector3;
      color: number;
    }

    const branches: BranchNode[] = [
      // 1. Front Left Customer Node
      {
        path: [new THREE.Vector3(0, -1.85, 1.8), new THREE.Vector3(-1.3, -1.85, 2.5), new THREE.Vector3(-2.0, -1.85, 3.4)],
        pedestalPos: new THREE.Vector3(-2.0, -1.85, 3.4),
        color: 0x00f0ff,
      },
      // 2. Front Center Customer Node
      {
        path: [new THREE.Vector3(0, -1.85, 1.8), new THREE.Vector3(0.5, -1.85, 2.7), new THREE.Vector3(0.6, -1.85, 3.8)],
        pedestalPos: new THREE.Vector3(0.6, -1.85, 3.8),
        color: 0x38bdf8,
      },
      // 3. Front Right Customer Node
      {
        path: [new THREE.Vector3(0, -1.85, 1.8), new THREE.Vector3(1.7, -1.85, 2.3), new THREE.Vector3(2.6, -1.85, 3.0)],
        pedestalPos: new THREE.Vector3(2.6, -1.85, 3.0),
        color: 0xa855f7,
      },
      // 4. Far Left Security Node
      {
        path: [new THREE.Vector3(-1.8, -1.85, 0), new THREE.Vector3(-2.9, -1.85, 0.4), new THREE.Vector3(-3.6, -1.85, 0.9)],
        pedestalPos: new THREE.Vector3(-3.6, -1.85, 0.9),
        color: 0x38bdf8,
      },
      // 5. Far Right Node
      {
        path: [new THREE.Vector3(1.8, -1.85, -0.4), new THREE.Vector3(2.9, -1.85, 0.2), new THREE.Vector3(3.5, -1.85, 0.9)],
        pedestalPos: new THREE.Vector3(3.5, -1.85, 0.9),
        color: 0xec4899,
      },
    ];

    const travelingPhotons: { curve: THREE.CatmullRomCurve3; mesh: THREE.Mesh; progress: number; speed: number }[] = [];
    const pulsingNodeRings: { mesh: THREE.Mesh; baseScale: number }[] = [];

    branches.forEach((b) => {
      // Draw Circuit Track Line
      const curve = new THREE.CatmullRomCurve3(b.path);
      const points = curve.getPoints(45);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.85,
        linewidth: 2,
      });
      const track = new THREE.Line(lineGeo, lineMat);
      circuitsGroup.add(track);

      // Elevated Hex Platform at Node End
      const pedGroup = new THREE.Group();
      pedGroup.position.copy(b.pedestalPos);

      const nodePedGeo = new THREE.CylinderGeometry(0.42, 0.48, 0.2, 6);
      const nodePedMat = new THREE.MeshStandardMaterial({
        color: 0x071e42,
        emissive: b.color,
        emissiveIntensity: 0.4,
        metalness: 0.9,
      });
      const nodePed = new THREE.Mesh(nodePedGeo, nodePedMat);
      pedGroup.add(nodePed);

      const nodePedEdges = new THREE.LineSegments(new THREE.EdgesGeometry(nodePedGeo), new THREE.LineBasicMaterial({ color: b.color }));
      nodePed.add(nodePedEdges);

      // Holographic Vertical Light Column
      const beamGeo = new THREE.CylinderGeometry(0.22, 0.22, 1.4, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 0.7, 0);
      pedGroup.add(beam);

      // Radar Concentric Ground Pulse Ring
      const pulseRingGeo = new THREE.RingGeometry(0.48, 0.65, 32);
      const pulseRingMat = new THREE.MeshBasicMaterial({
        color: b.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
      pulseRing.rotation.x = Math.PI / 2;
      pulseRing.position.set(0, 0.11, 0);
      pedGroup.add(pulseRing);
      pulsingNodeRings.push({ mesh: pulseRing, baseScale: 1.0 });

      // Floating User Avatar (👤 Head + Torso)
      const avatarGroup = new THREE.Group();
      avatarGroup.position.set(0, 0.82, 0);

      // Head
      const headGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const avatarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeo, avatarMat);
      head.position.set(0, 0.13, 0);
      avatarGroup.add(head);

      // Torso
      const torsoGeo = new THREE.CylinderGeometry(0.04, 0.15, 0.2, 16);
      const torso = new THREE.Mesh(torsoGeo, avatarMat);
      torso.position.set(0, -0.05, 0);
      avatarGroup.add(torso);

      pedGroup.add(avatarGroup);
      circuitsGroup.add(pedGroup);

      // Traveling Light Pulse
      const photonGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const photon = new THREE.Mesh(photonGeo, photonMat);
      circuitsGroup.add(photon);

      travelingPhotons.push({
        curve,
        mesh: photon,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.005,
      });
    });

    // ==========================================
    // 6. SCENE LIGHTING & AMBIENT GLOW
    // ==========================================
    // Interior Portal Point Light (Volumetric Blue Bloom)
    const portalLight = new THREE.PointLight(0x00f0ff, 3.5, 7.5);
    portalLight.position.set(0, -0.4, 1.3);
    rootGroup.add(portalLight);

    // Key Directional Light
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.9);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    // Rim Magenta Fill Light
    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.7);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // General Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 380 Ambient Floating Stardust Particles
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 16;
      starPositions[i + 1] = (Math.random() - 0.5) * 12;
      starPositions[i + 2] = (Math.random() - 0.5) * 14 - 1;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.038,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // ==========================================
    // 7. INTERACTION & ANIMATION LOOP
    // ==========================================
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseParallax = { x: 0, y: 0 };
    // Default isometric three-quarter viewing angle
    let targetRotation = { x: 0.18, y: 0.42 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseParallax = { x: nx * 0.15, y: ny * 0.15 };

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;
        targetRotation.x = Math.max(-0.25, Math.min(0.55, targetRotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support
    let prevTouch = { x: 0, y: 0 };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevTouch.x;
        const deltaY = e.touches[0].clientY - prevTouch.y;
        targetRotation.y += deltaX * 0.006;
        targetRotation.x += deltaY * 0.006;
        targetRotation.x = Math.max(-0.25, Math.min(0.55, targetRotation.x));
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle isometric breathing drift when idle
      if (!isDragging) {
        targetRotation.y = 0.42 + Math.sin(elapsedTime * 0.28) * 0.12;
      }

      rootGroup.rotation.y += (targetRotation.y - rootGroup.rotation.y) * 0.05;
      rootGroup.rotation.x += (targetRotation.x - rootGroup.rotation.x) * 0.05;

      // Mouse Parallax Camera Drift
      camera.position.x += (5.2 + mouseParallax.x - camera.position.x) * 0.04;
      camera.position.y += (4.4 + mouseParallax.y - camera.position.y) * 0.04;
      camera.lookAt(0, -0.1, 0);

      // Animate Traveling Circuit Photons
      travelingPhotons.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      // Pulse Radar Rings at Customer Node Pedestals
      const pulse = 1.0 + Math.sin(elapsedTime * 2.8) * 0.2;
      pulsingNodeRings.forEach(({ mesh }) => {
        mesh.scale.set(pulse, pulse, pulse);
      });

      // Animate Portal Shield Floating
      portalShield.position.y = -0.52 + Math.sin(elapsedTime * 2.5) * 0.035;
      portalShield.rotation.z = Math.sin(elapsedTime * 1.5) * 0.08;

      // Subtle pulse on ground ring
      floorRing.rotation.z += 0.0015;
      groundTicks.rotation.z -= 0.002;

      // Drift star points
      starPoints.rotation.y = elapsedTime * 0.005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      baseGeo.dispose();
      chamberGeo.dispose();
      entablatureGeo.dispose();
      pedimentGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[520px] lg:min-h-[640px] cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Bottom Gradient Blend */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent pointer-events-none" />

      {/* Floating Network Telemetry Badge */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-slate-900/85 border border-sky-500/35 text-[10px] font-mono text-sky-400 backdrop-blur-md shadow-lg pointer-events-none flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse drop-shadow-[0_0_6px_#22d3ee]" />
        <span>3D DIGITAL BANKING HUB • REAL-TIME TELEMETRY</span>
      </div>
    </div>
  );
};
