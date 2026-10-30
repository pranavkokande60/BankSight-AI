import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Hero3DVisualizerProps {
  mode?: 'globe' | 'bank';
  onToggleMode?: (mode: 'globe' | 'bank') => void;
  className?: string;
}

interface BankingHub {
  name: string;
  country: string;
  lat: number;
  lon: number;
  color: number;
  size: number;
}

export const Hero3DVisualizer: React.FC<Hero3DVisualizerProps> = ({
  mode = 'globe',
  onToggleMode,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMode, setCurrentMode] = useState<'globe' | 'bank'>(mode);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 640;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 9.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Main Visual Groups
    const globeParent = new THREE.Group();
    const bankParent = new THREE.Group();
    scene.add(globeParent);
    scene.add(bankParent);

    // Toggle visibility based on currentMode
    globeParent.visible = currentMode === 'globe';
    bankParent.visible = currentMode === 'bank';

    // ==========================================
    // A. 3D EUROPEAN GLOBE SCENE SETUP
    // ==========================================
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.38;
    globeGroup.rotation.y = -1.74; // Europe centered towards camera
    globeParent.add(globeGroup);

    const GLOBE_RADIUS = 3.1;

    // Procedural European Night-Lights Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#040d21';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Latitude & Longitude Navigation Grid
    ctx.strokeStyle = 'rgba(38, 98, 178, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const toCanvas = (lat: number, lon: number): [number, number] => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      return [x, y];
    };

    const drawLandmass = (
      points: [number, number][],
      fillColor = 'rgba(14, 65, 128, 0.75)',
      strokeColor = 'rgba(56, 189, 248, 0.95)',
      lineWidth = 2.0
    ) => {
      if (points.length < 2) return;
      ctx.beginPath();
      const [startLat, startLon] = points[0];
      const [sx, sy] = toCanvas(startLat, startLon);
      ctx.moveTo(sx, sy);
      for (let i = 1; i < points.length; i++) {
        const [lat, lon] = points[i];
        const [cx, cy] = toCanvas(lat, lon);
        ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Vector Continents
    const centralEurope: [number, number][] = [
      [36, -5.5], [37, -9], [43, -9.5], [43.5, -1.8], [47, -4.5],
      [49.5, -1.5], [51, 2], [54, 8], [57, 10], [60, 5],
      [63, 10], [70, 20], [71, 28], [68, 45], [60, 50],
      [55, 40], [50, 32], [45, 36], [41, 28], [37, 24],
      [38, 20], [40, 18], [44, 13], [44, 8], [42, 3],
      [36, -2], [36, -5.5]
    ];
    drawLandmass(centralEurope, 'rgba(8, 47, 98, 0.85)', 'rgba(56, 189, 248, 0.95)', 2.5);

    const iberia: [number, number][] = [
      [36, -5.5], [37, -9], [42, -9], [43.5, -8], [43.5, -2],
      [42.5, 3], [37, 0], [36, -3], [36, -5.5]
    ];
    drawLandmass(iberia, 'rgba(14, 65, 128, 0.9)', 'rgba(125, 211, 252, 1.0)', 2.5);

    const france: [number, number][] = [
      [43.5, -1.8], [46, -1.2], [48.5, -4.5], [49.5, -1.5], [51, 2.5],
      [49, 6], [46, 6], [43.5, 7.5], [42.5, 3], [43.5, -1.8]
    ];
    drawLandmass(france, 'rgba(12, 74, 142, 0.85)', 'rgba(56, 189, 248, 1.0)', 2.0);

    const germany: [number, number][] = [
      [47.5, 7.5], [49, 6], [51, 6], [54, 8.5], [54.5, 10],
      [54, 14], [51, 15], [48.5, 13.5], [47.5, 11], [47.5, 7.5]
    ];
    drawLandmass(germany, 'rgba(16, 85, 160, 0.85)', 'rgba(14, 165, 233, 1.0)', 2.2);

    const uk: [number, number][] = [
      [50, -5], [52, -5], [55, -5], [58, -3], [58, -1],
      [53, 0], [51, 1], [50, -1], [50, -5]
    ];
    drawLandmass(uk, 'rgba(10, 58, 115, 0.85)', 'rgba(56, 189, 248, 0.9)', 2.0);

    // High-Density Radar Dot Matrix
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    for (let x = 0; x < canvas.width; x += 16) {
      for (let y = 0; y < canvas.height; y += 16) {
        const lat = 90 - (y / canvas.height) * 180;
        const lon = (x / canvas.width) * 360 - 180;
        if (lat >= 34 && lat <= 62 && lon >= -12 && lon <= 35) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Dense City Night-Lights
    const cityLights: [number, number, number, string][] = [
      [50.11, 8.68, 7.0, '#38bdf8'],   // Frankfurt
      [48.85, 2.35, 7.0, '#22d3ee'],   // Paris
      [40.41, -3.70, 6.5, '#fbbf24'],  // Madrid
      [52.52, 13.40, 6.0, '#38bdf8'],  // Berlin
      [51.50, -0.12, 6.5, '#818cf8'],  // London
      [47.37, 8.54, 5.5, '#34d399'],   // Zurich
      [52.37, 4.90, 5.5, '#22d3ee'],   // Amsterdam
      [45.46, 9.19, 5.5, '#c084fc'],   // Milan
      [41.90, 12.49, 5.0, '#f472b6'],  // Rome
      [48.20, 16.37, 5.0, '#fbbf24'],  // Vienna
      [48.13, 11.58, 5.0, '#38bdf8'],  // Munich
      [41.38, 2.17, 5.0, '#fbbf24'],   // Barcelona
      [45.76, 4.83, 4.5, '#22d3ee'],   // Lyon
      [53.55, 9.99, 4.5, '#38bdf8'],   // Hamburg
      [50.85, 4.35, 5.0, '#38bdf8'],   // Brussels
    ];

    for (let i = 0; i < 180; i++) {
      const lat = 36 + Math.random() * 22;
      const lon = -9 + Math.random() * 28;
      const sz = Math.random() * 2.8 + 1.2;
      const color = Math.random() > 0.4 ? '#38bdf8' : '#fef08a';
      cityLights.push([lat, lon, sz, color]);
    }

    cityLights.forEach(([lat, lon, sz, color]) => {
      const [cx, cy] = toCanvas(lat, lon);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 3.2);
      grad.addColorStop(0, color);
      grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, sz * 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, sz * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    const globeTexture = new THREE.CanvasTexture(canvas);
    globeTexture.wrapS = THREE.RepeatWrapping;
    globeTexture.wrapT = THREE.ClampToEdgeWrapping;

    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      map: globeTexture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x0a3264),
      shininess: 20,
      emissive: new THREE.Color(0x03122c),
      emissiveIntensity: 0.5,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Atmospheric Halos
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    globeGroup.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));

    // European Hubs & Arcs
    const hubs: BankingHub[] = [
      { name: 'Frankfurt (ECB Hub)', country: 'Germany', lat: 50.1109, lon: 8.6821, color: 0x38bdf8, size: 0.095 },
      { name: 'Paris (Headquarters)', country: 'France', lat: 48.8566, lon: 2.3522, color: 0x22d3ee, size: 0.09 },
      { name: 'Madrid (Retail HQ)', country: 'Spain', lat: 40.4168, lon: -3.7038, color: 0xf59e0b, size: 0.09 },
      { name: 'Berlin (Fintech Hub)', country: 'Germany', lat: 52.5200, lon: 13.4050, color: 0x38bdf8, size: 0.08 },
      { name: 'London (Treasury)', country: 'UK', lat: 51.5074, lon: -0.1278, color: 0x818cf8, size: 0.08 },
      { name: 'Zurich (Private Wealth)', country: 'Switzerland', lat: 47.3769, lon: 8.5417, color: 0x10b981, size: 0.075 },
      { name: 'Amsterdam (Payments)', country: 'Netherlands', lat: 52.3676, lon: 4.9041, color: 0x38bdf8, size: 0.075 },
      { name: 'Milan (Commercial)', country: 'Italy', lat: 45.4642, lon: 9.1900, color: 0xc084fc, size: 0.07 },
    ];

    const latLonToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    const hubGroup = new THREE.Group();
    const pulsingRings: { mesh: THREE.Mesh; baseScale: number }[] = [];

    hubs.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS * 1.012);
      const nodeGeo = new THREE.SphereGeometry(hub.size, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      hubGroup.add(nodeMesh);

      const ringGeo = new THREE.RingGeometry(hub.size * 1.2, hub.size * 2.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos.clone().multiplyScalar(1.002));
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      hubGroup.add(ringMesh);
      pulsingRings.push({ mesh: ringMesh, baseScale: 1.0 });
    });
    globeGroup.add(hubGroup);

    // Telemetry Bezier Arcs
    const arcConnections: [BankingHub, BankingHub][] = [
      [hubs[0], hubs[1]], // Frankfurt - Paris
      [hubs[0], hubs[2]], // Frankfurt - Madrid
      [hubs[1], hubs[2]], // Paris - Madrid
      [hubs[0], hubs[3]], // Frankfurt - Berlin
      [hubs[1], hubs[4]], // Paris - London
      [hubs[0], hubs[5]], // Frankfurt - Zurich
      [hubs[0], hubs[6]], // Frankfurt - Amsterdam
      [hubs[1], hubs[7]], // Paris - Milan
    ];

    const arcGroup = new THREE.Group();
    const photons: { curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; progress: number; speed: number }[] = [];

    arcConnections.forEach(([startHub, endHub], idx) => {
      const p1 = latLonToVector3(startHub.lat, startHub.lon, GLOBE_RADIUS * 1.012);
      const p2 = latLonToVector3(endHub.lat, endHub.lon, GLOBE_RADIUS * 1.012);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(1.3, dist * 0.48));

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const curveMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0x818cf8,
        transparent: true,
        opacity: 0.75,
      });
      arcGroup.add(new THREE.Line(curveGeo, curveMat));

      const photonGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      arcGroup.add(photonMesh);
      photons.push({ curve, mesh: photonMesh, progress: Math.random(), speed: 0.005 + Math.random() * 0.005 });
    });
    globeGroup.add(arcGroup);

    // Orbital Rings
    const orbit1Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.35, 0.016, 16, 128);
    const orbit1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.rotation.x = Math.PI / 3.2;
    globeGroup.add(orbit1);

    const orbit2Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.48, 0.014, 16, 128);
    const orbit2Mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35 });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = -Math.PI / 4;
    globeGroup.add(orbit2);

    // Holographic Base Podium (for Globe)
    const globePodium = new THREE.Group();
    globePodium.position.set(0, -3.18, 0);

    const ringDiscGeo = new THREE.RingGeometry(1.6, 3.6, 64);
    const ringDiscMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const ringDisc = new THREE.Mesh(ringDiscGeo, ringDiscMat);
    ringDisc.rotation.x = Math.PI / 2;
    globePodium.add(ringDisc);

    const innerRingGeo = new THREE.RingGeometry(0.8, 1.5, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    globePodium.add(innerRing);

    globeParent.add(globePodium);

    // ==========================================
    // B. 3D DIGITAL BANK HEADQUARTERS SETUP
    // ==========================================
    const bankGroup = new THREE.Group();
    bankParent.add(bankGroup);

    // 1. Multi-Tiered Illuminated Base Platform
    const p1Geo = new THREE.BoxGeometry(4.4, 0.28, 3.4);
    const p1Mat = new THREE.MeshStandardMaterial({
      color: 0x071b3d,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x021738,
    });
    const p1 = new THREE.Mesh(p1Geo, p1Mat);
    p1.position.set(0, -1.8, 0);
    bankGroup.add(p1);

    // Glowing Neon Edge on Platform 1
    const p1EdgeGeo = new THREE.EdgesGeometry(p1Geo);
    const p1EdgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    p1.add(new THREE.LineSegments(p1EdgeGeo, p1EdgeMat));

    // Platform Tier 2
    const p2Geo = new THREE.BoxGeometry(3.6, 0.22, 2.8);
    const p2 = new THREE.Mesh(p2Geo, p1Mat);
    p2.position.set(0, -1.55, 0);
    bankGroup.add(p2);

    const p2EdgeGeo = new THREE.EdgesGeometry(p2Geo);
    const p2EdgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
    p2.add(new THREE.LineSegments(p2EdgeGeo, p2EdgeMat));

    // Platform Tier 3 (Pillars base)
    const p3Geo = new THREE.BoxGeometry(2.9, 0.18, 2.2);
    const p3 = new THREE.Mesh(p3Geo, p1Mat);
    p3.position.set(0, -1.35, 0);
    bankGroup.add(p3);

    // Bank Main Chamber Body
    const chamberGeo = new THREE.BoxGeometry(2.2, 1.4, 1.6);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0x0d2857,
      roughness: 0.2,
      metalness: 0.7,
      emissive: 0x061e47,
    });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.position.set(0, -0.55, -0.15);
    bankGroup.add(chamber);

    // Bank Entrance Portal (Glowing Doorway)
    const doorGeo = new THREE.PlaneGeometry(0.65, 0.95);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, -0.75, 0.66);
    bankGroup.add(door);

    // 4 Classical Illuminated Pillars in front
    const pillarPositions = [-0.95, -0.32, 0.32, 0.95];
    pillarPositions.forEach((px) => {
      const colGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16);
      const colMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(px, -0.55, 0.65);
      bankGroup.add(col);
    });

    // Entablature (Beam above pillars)
    const entablatureGeo = new THREE.BoxGeometry(2.5, 0.22, 1.9);
    const entablature = new THREE.Mesh(entablatureGeo, chamberMat);
    entablature.position.set(0, 0.25, 0);
    bankGroup.add(entablature);

    const entEdge = new THREE.LineSegments(new THREE.EdgesGeometry(entablatureGeo), new THREE.LineBasicMaterial({ color: 0x00f0ff }));
    entablature.add(entEdge);

    // Triangular Pediment / Roof
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-1.3, 0);
    roofShape.lineTo(0, 0.85);
    roofShape.lineTo(1.3, 0);
    roofShape.closePath();

    const extrudeSettings = { depth: 1.85, bevelEnabled: false };
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0b2552,
      emissive: 0x031d47,
      roughness: 0.25,
      metalness: 0.8,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 0.36, -1.0);
    bankGroup.add(roof);

    // Glowing Neon "BANK" Signage Banner on Front Facade
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const signCtx = signCanvas.getContext('2d')!;
    signCtx.fillStyle = '#051329';
    signCtx.fillRect(0, 0, 512, 128);
    signCtx.font = 'bold 64px "Plus Jakarta Sans", sans-serif';
    signCtx.fillStyle = '#38bdf8';
    signCtx.textAlign = 'center';
    signCtx.textBaseline = 'middle';
    signCtx.shadowColor = '#00f0ff';
    signCtx.shadowBlur = 18;
    signCtx.fillText('BANK', 256, 64);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(1.2, 0.32);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture, transparent: true });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, 0.58, 0.86);
    bankGroup.add(signMesh);

    // Floating Customer Holographic Pedestals around the Bank
    const customerNodes: { mesh: THREE.Mesh; angle: number; radius: number; speed: number }[] = [];
    const customerOffsets = [
      { r: 2.3, a: 0.4, color: 0x38bdf8 },
      { r: 2.5, a: 2.1, color: 0xa855f7 },
      { r: 2.2, a: 3.8, color: 0x22d3ee },
      { r: 2.6, a: 5.2, color: 0xec4899 },
    ];

    customerOffsets.forEach((node) => {
      const nodeGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: node.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(Math.cos(node.a) * node.r, -1.6, Math.sin(node.a) * node.r);
      bankGroup.add(nodeMesh);

      // Light beam shooting up
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16);
      const beamMat = new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0.35 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 0.45, 0);
      nodeMesh.add(beam);

      customerNodes.push({ mesh: nodeMesh, angle: node.a, radius: node.r, speed: 0.003 });
    });

    // Default Bank orientation: slightly isometric angled view
    bankGroup.rotation.y = 0.45;
    bankGroup.rotation.x = 0.22;

    // ==========================================
    // C. COMMON SCENE LIGHTING & PARTICLES
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 1.5);
    keyLight.position.set(3, 4, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    rimLight.position.set(-5, 2, -4);
    scene.add(rimLight);

    // Stardust Particles
    const starCount = 380;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 18;
      starPositions[i + 1] = (Math.random() - 0.5) * 14;
      starPositions[i + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 12. Interaction Handlers
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseParallax = { x: 0, y: 0 };
    let targetRotation = { x: 0.38, y: -1.74 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseParallax = { x: nx * 0.12, y: ny * 0.12 };

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;
        targetRotation.x = Math.max(-0.6, Math.min(0.8, targetRotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => { isDragging = false; };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 13. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (currentMode === 'globe') {
        if (!isDragging) {
          targetRotation.y = -1.74 + Math.sin(elapsedTime * 0.2) * 0.22;
        }
        globeGroup.rotation.y += (targetRotation.y - globeGroup.rotation.y) * 0.06;
        globeGroup.rotation.x += (targetRotation.x - globeGroup.rotation.x) * 0.06;

        photons.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;
          p.mesh.position.copy(p.curve.getPoint(p.progress));
        });

        const pulse = 1.0 + Math.sin(elapsedTime * 3.0) * 0.25;
        pulsingRings.forEach(({ mesh }) => mesh.scale.set(pulse, pulse, pulse));

        orbit1.rotation.z += 0.0022;
        orbit2.rotation.z -= 0.0018;
        innerRing.rotation.z += 0.003;
      } else {
        if (!isDragging) {
          bankGroup.rotation.y = 0.45 + Math.sin(elapsedTime * 0.25) * 0.18;
        } else {
          bankGroup.rotation.y += (targetRotation.y - bankGroup.rotation.y) * 0.06;
        }
      }

      camera.position.x += (mouseParallax.x - camera.position.x) * 0.04;
      camera.position.y += (0.5 + mouseParallax.y - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      starPoints.rotation.y = elapsedTime * 0.006;
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
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
    };
  }, [currentMode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] lg:min-h-[620px] cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* 3D Mode Selector Toggle in top-center */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center p-1 rounded-full bg-slate-900/85 border border-sky-500/35 backdrop-blur-md shadow-lg pointer-events-auto">
        <button
          onClick={() => {
            setCurrentMode('globe');
            onToggleMode?.('globe');
          }}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all ${
            currentMode === 'globe'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌐 European Network
        </button>
        <button
          onClick={() => {
            setCurrentMode('bank');
            onToggleMode?.('bank');
          }}
          className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-all ${
            currentMode === 'bank'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏛️ 3D Digital Bank
        </button>
      </div>

      {/* Bottom Gradient Blend */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent pointer-events-none" />

      {/* Process Flow Bar at the base of the podium */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-sky-500/30 text-[11px] font-mono font-medium text-slate-300 backdrop-blur-md shadow-xl flex items-center space-x-3 pointer-events-auto">
        <span className="text-sky-400 font-semibold">Analyze</span>
        <span className="text-slate-600">→</span>
        <span className="text-cyan-300 font-semibold">Predict</span>
        <span className="text-slate-600">→</span>
        <span className="text-indigo-400 font-semibold">Explain</span>
        <span className="text-slate-600">→</span>
        <span className="text-pink-400 font-semibold">Retain</span>
      </div>
    </div>
  );
};
