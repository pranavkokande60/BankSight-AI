import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Europe3DGlobeProps {
  onNodeClick?: (cityName: string) => void;
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

export const Europe3DGlobe: React.FC<Europe3DGlobeProps> = ({ onNodeClick, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCity, setActiveCity] = useState<string>('Frankfurt (ECB Hub)');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 640;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 8.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Globe Group
    const globeGroup = new THREE.Group();
    // Default rotation: Orient Western/Central Europe (lat 48°N, lon 10°E) directly facing the camera
    globeGroup.rotation.x = 0.38;
    globeGroup.rotation.y = -1.74;
    scene.add(globeGroup);

    const GLOBE_RADIUS = 3.1;

    // 3. High-Contrast Procedural Canvas Texture for European Night Lights & Continents
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep midnight ocean background
    ctx.fillStyle = '#040d21';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle holographic latitude and longitude grid
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

    // Helper: convert Lat/Lon to Canvas Coordinates (x, y)
    const toCanvas = (lat: number, lon: number): [number, number] => {
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      return [x, y];
    };

    // Helper: Draw continent polygons with glowing outline
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

    // Detailed European Coastlines & Polygons
    const centralEurope: [number, number][] = [
      [36, -5.5], [37, -9], [43, -9.5], [43.5, -1.8], [47, -4.5],
      [49.5, -1.5], [51, 2], [54, 8], [57, 10], [60, 5],
      [63, 10], [70, 20], [71, 28], [68, 45], [60, 50],
      [55, 40], [50, 32], [45, 36], [41, 28], [37, 24],
      [38, 20], [40, 18], [44, 13], [44, 8], [42, 3],
      [36, -2], [36, -5.5]
    ];
    drawLandmass(centralEurope, 'rgba(8, 47, 98, 0.85)', 'rgba(56, 189, 248, 0.95)', 2.5);

    // Iberia (Spain & Portugal)
    const iberia: [number, number][] = [
      [36, -5.5], [37, -9], [42, -9], [43.5, -8], [43.5, -2],
      [42.5, 3], [37, 0], [36, -3], [36, -5.5]
    ];
    drawLandmass(iberia, 'rgba(14, 65, 128, 0.9)', 'rgba(125, 211, 252, 1.0)', 2.5);

    // France Mainland Highlight
    const france: [number, number][] = [
      [43.5, -1.8], [46, -1.2], [48.5, -4.5], [49.5, -1.5], [51, 2.5],
      [49, 6], [46, 6], [43.5, 7.5], [42.5, 3], [43.5, -1.8]
    ];
    drawLandmass(france, 'rgba(12, 74, 142, 0.85)', 'rgba(56, 189, 248, 1.0)', 2.0);

    // Germany Mainland Highlight
    const germany: [number, number][] = [
      [47.5, 7.5], [49, 6], [51, 6], [54, 8.5], [54.5, 10],
      [54, 14], [51, 15], [48.5, 13.5], [47.5, 11], [47.5, 7.5]
    ];
    drawLandmass(germany, 'rgba(16, 85, 160, 0.85)', 'rgba(14, 165, 233, 1.0)', 2.2);

    // Italy Peninsula
    const italy: [number, number][] = [
      [44, 8], [44, 13], [42, 14], [40, 18], [38, 16],
      [38, 13], [41, 12], [43, 10], [44, 8]
    ];
    drawLandmass(italy, 'rgba(12, 74, 142, 0.85)', 'rgba(56, 189, 248, 0.95)', 2.0);

    // British Isles (UK & Ireland)
    const uk: [number, number][] = [
      [50, -5], [52, -5], [55, -5], [58, -3], [58, -1],
      [53, 0], [51, 1], [50, -1], [50, -5]
    ];
    drawLandmass(uk, 'rgba(10, 58, 115, 0.85)', 'rgba(56, 189, 248, 0.9)', 2.0);

    const ireland: [number, number][] = [
      [51.5, -10], [54, -10], [55, -7], [53, -6], [52, -6.5], [51.5, -10]
    ];
    drawLandmass(ireland, 'rgba(10, 58, 115, 0.85)', 'rgba(56, 189, 248, 0.85)', 1.5);

    // Scandinavia
    const scandinavia: [number, number][] = [
      [58, 6], [62, 5], [66, 12], [70, 20], [70, 28],
      [65, 25], [60, 19], [56, 13], [58, 6]
    ];
    drawLandmass(scandinavia, 'rgba(8, 45, 90, 0.8)', 'rgba(56, 189, 248, 0.85)', 1.8);

    // Mediterranean Coast / North Africa
    const northAfrica: [number, number][] = [
      [35, -10], [36, 10], [32, 25], [31, 34], [25, 35],
      [20, 25], [20, 0], [25, -15], [35, -10]
    ];
    drawLandmass(northAfrica, 'rgba(6, 28, 60, 0.85)', 'rgba(30, 80, 140, 0.7)', 1.5);

    // Dot-Matrix Landmass Density Grid (Creates that high-tech radar continent feel)
    const dotGridSpacing = 16;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
    for (let x = 0; x < canvas.width; x += dotGridSpacing) {
      for (let y = 0; y < canvas.height; y += dotGridSpacing) {
        // High density around Europe
        const lat = 90 - (y / canvas.height) * 180;
        const lon = (x / canvas.width) * 360 - 180;
        if (lat >= 34 && lat <= 62 && lon >= -12 && lon <= 35) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Dense Golden & Cyan Night Lights across European Metropolitan Hubs
    const cityLights: [number, number, number, string][] = [
      // Frankfurt, Paris, Madrid, Berlin, London, Zurich, Amsterdam, Milan, Rome, Vienna, Munich
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
      [51.22, 6.77, 4.5, '#38bdf8'],   // Dusseldorf
      [37.38, -5.98, 4.0, '#fbbf24'],  // Seville
      [39.46, -0.37, 4.0, '#fbbf24'],  // Valencia
    ];

    // Add 160 secondary glowing population cluster lights in Western Europe
    for (let i = 0; i < 180; i++) {
      const lat = 36 + Math.random() * 22;
      const lon = -9 + Math.random() * 28;
      const sz = Math.random() * 2.8 + 1.2;
      const color = Math.random() > 0.4 ? '#38bdf8' : '#fef08a';
      cityLights.push([lat, lon, sz, color]);
    }

    cityLights.forEach(([lat, lon, sz, color]) => {
      const [cx, cy] = toCanvas(lat, lon);
      // Soft radial glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz * 3.2);
      grad.addColorStop(0, color);
      grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, sz * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, sz * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    const globeTexture = new THREE.CanvasTexture(canvas);
    globeTexture.wrapS = THREE.RepeatWrapping;
    globeTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 4. Main Globe Mesh
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

    // 5. Outer Atmospheric Glow Shell
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Outer Halo Rim
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 6. European Banking Capital Nodes
    const hubs: BankingHub[] = [
      { name: 'Frankfurt (ECB Hub)', country: 'Germany', lat: 50.1109, lon: 8.6821, color: 0x38bdf8, size: 0.095 },
      { name: 'Paris (Headquarters)', country: 'France', lat: 48.8566, lon: 2.3522, color: 0x22d3ee, size: 0.09 },
      { name: 'Madrid (Retail HQ)', country: 'Spain', lat: 40.4168, lon: -3.7038, color: 0xf59e0b, size: 0.09 },
      { name: 'Berlin (Fintech Hub)', country: 'Germany', lat: 52.5200, lon: 13.4050, color: 0x38bdf8, size: 0.08 },
      { name: 'London (Treasury)', country: 'UK', lat: 51.5074, lon: -0.1278, color: 0x818cf8, size: 0.08 },
      { name: 'Zurich (Private Wealth)', country: 'Switzerland', lat: 47.3769, lon: 8.5417, color: 0x10b981, size: 0.075 },
      { name: 'Amsterdam (Payments)', country: 'Netherlands', lat: 52.3676, lon: 4.9041, color: 0x38bdf8, size: 0.075 },
      { name: 'Milan (Commercial)', country: 'Italy', lat: 45.4642, lon: 9.1900, color: 0xc084fc, size: 0.07 },
      { name: 'Barcelona (Digital)', country: 'Spain', lat: 41.3879, lon: 2.1699, color: 0xf59e0b, size: 0.07 },
      { name: 'Munich (Asset Mgmt)', country: 'Germany', lat: 48.1351, lon: 11.5820, color: 0x38bdf8, size: 0.07 },
      { name: 'Vienna (Central & East)', country: 'Austria', lat: 48.2082, lon: 16.3738, color: 0xf59e0b, size: 0.07 },
    ];

    // Helper: lat/lon to 3D Cartesian coordinates
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

      // Core glowing node
      const nodeGeo = new THREE.SphereGeometry(hub.size, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: hub.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      hubGroup.add(nodeMesh);

      // Concentric pulsing radar ring
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

    // 7. Glowing Inter-Bank Telemetry Arcs (Great Circle Bezier Curves)
    const arcConnections: [BankingHub, BankingHub][] = [
      [hubs[0], hubs[1]], // Frankfurt - Paris
      [hubs[0], hubs[2]], // Frankfurt - Madrid
      [hubs[1], hubs[2]], // Paris - Madrid
      [hubs[0], hubs[3]], // Frankfurt - Berlin
      [hubs[1], hubs[4]], // Paris - London
      [hubs[0], hubs[5]], // Frankfurt - Zurich
      [hubs[0], hubs[6]], // Frankfurt - Amsterdam
      [hubs[1], hubs[7]], // Paris - Milan
      [hubs[2], hubs[8]], // Madrid - Barcelona
      [hubs[0], hubs[9]], // Frankfurt - Munich
      [hubs[0], hubs[10]], // Frankfurt - Vienna
      [hubs[4], hubs[6]], // London - Amsterdam
    ];

    const arcGroup = new THREE.Group();
    const photons: { curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh; progress: number; speed: number }[] = [];

    arcConnections.forEach(([startHub, endHub], idx) => {
      const p1 = latLonToVector3(startHub.lat, startHub.lon, GLOBE_RADIUS * 1.012);
      const p2 = latLonToVector3(endHub.lat, endHub.lon, GLOBE_RADIUS * 1.012);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const elevation = GLOBE_RADIUS + Math.min(1.3, distance * 0.48);
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const curvePoints = curve.getPoints(50);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0x818cf8,
        transparent: true,
        opacity: 0.75,
      });
      const arcLine = new THREE.Line(curveGeo, curveMat);
      arcGroup.add(arcLine);

      // High-luminance traveling photon
      const photonGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      arcGroup.add(photonMesh);

      photons.push({
        curve,
        mesh: photonMesh,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.005,
      });
    });
    globeGroup.add(arcGroup);

    // 8. Tilted Dual Orbital Rings (Tech Accents)
    const orbitGroup = new THREE.Group();

    // Orbital Ring 1
    const orbit1Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.35, 0.016, 16, 128);
    const orbit1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.rotation.x = Math.PI / 3.2;
    orbit1.rotation.y = Math.PI / 6;
    orbitGroup.add(orbit1);

    // Orbital Ring 2 (Counter-tilted)
    const orbit2Geo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.48, 0.014, 16, 128);
    const orbit2Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.35,
    });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = -Math.PI / 4;
    orbit2.rotation.y = -Math.PI / 5;
    orbitGroup.add(orbit2);

    globeGroup.add(orbitGroup);

    // 9. Luminous Holographic Pedestal / Base Platform (Visible under Globe)
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -3.18, 0);

    // Outer Glowing Ring Disc
    const discGeo = new THREE.RingGeometry(1.6, 3.5, 64);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = Math.PI / 2;
    pedestalGroup.add(disc);

    // Inner Concentric Ticks Ring
    const innerRingGeo = new THREE.RingGeometry(0.8, 1.5, 64);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    pedestalGroup.add(innerRing);

    // Central Projector Node
    const centerPointGeo = new THREE.CircleGeometry(0.7, 32);
    const centerPointMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const centerPoint = new THREE.Mesh(centerPointGeo, centerPointMat);
    centerPoint.rotation.x = Math.PI / 2;
    pedestalGroup.add(centerPoint);

    // Holographic Vertical Light Cone
    const coneGeo = new THREE.CylinderGeometry(GLOBE_RADIUS * 0.92, 0.7, 2.0, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, 1.0, 0);
    pedestalGroup.add(cone);

    scene.add(pedestalGroup);

    // 10. Ambient Floating Stardust Particles
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

    // 11. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 1.4);
    keyLight.position.set(3, 4, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    rimLight.position.set(-5, 2, -4);
    scene.add(rimLight);

    // 12. Interaction Handlers (Mouse Parallax & Drag Orbit)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseParallax = { x: 0, y: 0 };
    // Europe focused default target rotation
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

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support for mobile
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
        targetRotation.x = Math.max(-0.6, Math.min(0.8, targetRotation.x));
        prevTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });

    // 13. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle, restrained drift around Europe focal point
      if (!isDragging) {
        // Slow gentle sinusoidal oscillating drift so Europe stays centered
        targetRotation.y = -1.74 + Math.sin(elapsedTime * 0.2) * 0.22;
      }

      globeGroup.rotation.y += (targetRotation.y - globeGroup.rotation.y) * 0.06;
      globeGroup.rotation.x += (targetRotation.x - globeGroup.rotation.x) * 0.06;

      // Mouse Parallax Camera Drift
      camera.position.x += (mouseParallax.x - camera.position.x) * 0.04;
      camera.position.y += (0.4 + mouseParallax.y - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Animate Traveling Photons along Telemetry Arcs
      photons.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      // Pulse Radar Rings around Banking Hubs
      const pulse = 1.0 + Math.sin(elapsedTime * 3.0) * 0.25;
      pulsingRings.forEach(({ mesh }) => {
        mesh.scale.set(pulse, pulse, pulse);
      });

      // Rotate Orbital Rings & Base Pedestal
      orbit1.rotation.z += 0.0022;
      orbit2.rotation.z -= 0.0018;
      innerRing.rotation.z += 0.003;

      // Drift star points
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
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      globeTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[500px] lg:min-h-[620px] cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Bottom Pedestal Glow */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent pointer-events-none" />

      {/* Desktop Interaction Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 border border-sky-500/30 text-[10px] font-mono text-sky-400 backdrop-blur pointer-events-none opacity-80 shadow-md">
        Interactive 3D Europe Hub • Drag to Rotate & Explore Telemetry
      </div>
    </div>
  );
};
