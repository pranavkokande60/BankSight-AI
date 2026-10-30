import React, { useState, useEffect, useRef } from 'react';
import {
  Orbit,
  Filter,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldAlert,
  ArrowRight,
  User,
  Sliders,
  Compass,
  Play,
  Pause,
  Layers,
  ZoomIn,
  Activity,
  Maximize2,
  Minimize2,
  Globe,
  Share2,
} from 'lucide-react';
import * as THREE from 'three';
import { api } from '../api';

declare global {
  interface Window {
    Plotly: any;
  }
}

export const Galaxy3DTab: React.FC = () => {
  const [algo, setAlgo] = useState<'kmeans' | 'gmm' | 'agglomerative'>('kmeans');
  const [k, setK] = useState<number>(4);
  const [colorBy, setColorBy] = useState<'Cluster' | 'Geography' | 'Exited' | 'Balance' | 'IsActiveMember'>('Cluster');
  const [isolatedCluster, setIsolatedCluster] = useState<number | null>(null);
  const [particleSize, setParticleSize] = useState<number>(0.35); // Calibrated world units
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotateSpeed, setRotateSpeed] = useState<number>(0.8);
  const [showConstellations, setShowConstellations] = useState<boolean>(true);
  const [renderEngine, setRenderEngine] = useState<'threejs' | 'plotly'>('threejs');
  const [loading, setLoading] = useState<boolean>(true);
  const [galaxyData, setGalaxyData] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  const mountRef = useRef<HTMLDivElement>(null);
  const plotlyContainerRef = useRef<HTMLDivElement>(null);
  const threeStateRef = useRef<any>({});

  const fetchGalaxy = () => {
    setLoading(true);
    api.getGalaxyCoordinates(k, algo, 2000)
      .then((data) => {
        setGalaxyData(data);
        if (data.points && data.points.length > 0) {
          setSelectedPoint(data.points[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGalaxy();
  }, [k, algo]);

  // Color mapper helper
  const getPointColor = (p: any, mode: string, isDimmed: boolean = false) => {
    if (isDimmed) return new THREE.Color('#1e293b');

    if (mode === 'Cluster') {
      const palette = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];
      return new THREE.Color(palette[p.Cluster % palette.length]);
    }
    if (mode === 'Geography') {
      if (p.Geography === 'Germany') return new THREE.Color('#f43f5e'); // Red/Crimson
      if (p.Geography === 'France') return new THREE.Color('#38bdf8'); // Cyan/Blue
      return new THREE.Color('#f59e0b'); // Spain - Amber
    }
    if (mode === 'Exited') {
      return p.Exited === 1 ? new THREE.Color('#f43f5e') : new THREE.Color('#10b981');
    }
    if (mode === 'IsActiveMember') {
      return p.IsActiveMember === 1 ? new THREE.Color('#38bdf8') : new THREE.Color('#f97316');
    }
    // Balance
    const ratio = Math.min(1.0, (p.Balance || 0) / 160000);
    return new THREE.Color().lerpColors(new THREE.Color('#1e293b'), new THREE.Color('#38bdf8'), ratio);
  };

  // ==========================================
  // THREE.JS WEBGL GALAXY ENGINE (CRISP RENDERING)
  // ==========================================
  useEffect(() => {
    if (renderEngine !== 'threejs' || !galaxyData || !galaxyData.points || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scale PCA coordinates across comfortable 3D space
    const COORD_SCALE = 8.0;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020617, 1);

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 80);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Dynamic Crisp Star Dot Texture (Solid Core + Crisp Anti-Aliased Rim)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 28);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // Deep Cosmic Starfield Backdrop (Round specks, no square blocks)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 160;
      starPos[i + 1] = (Math.random() - 0.5) * 160;
      starPos[i + 2] = (Math.random() - 0.5) * 160;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.35,
      map: particleTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Customer Galaxy Particle Cloud
    const points = galaxyData.points;
    const count = points.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    points.forEach((p: any, i: number) => {
      positions[i * 3] = (p.PCA_1 || 0) * COORD_SCALE;
      positions[i * 3 + 1] = (p.PCA_2 || 0) * COORD_SCALE;
      positions[i * 3 + 2] = (p.PCA_3 || 0) * COORD_SCALE;

      const isDimmed = isolatedCluster !== null && p.Cluster !== isolatedCluster;
      const c = getPointColor(p, colorBy, isDimmed);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Crisp Normal-Blending PointsMaterial (Avoids Additive Color Blowout)
    const particlesMat = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.92,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Holographic Cluster Centroid Beacons
    const centroids = galaxyData.centroids_3d || [];
    const centroidGroup = new THREE.Group();
    centroids.forEach((cent: any) => {
      const isDimmed = isolatedCluster !== null && cent.cluster !== isolatedCluster;
      if (isDimmed) return;

      const palette = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];
      const cHex = palette[cent.cluster % palette.length];

      // Centroid Octahedron Beacon
      const coreGeo = new THREE.OctahedronGeometry(0.5, 0);
      const coreMat = new THREE.MeshBasicMaterial({ color: cHex, wireframe: true });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(cent.x * COORD_SCALE, cent.y * COORD_SCALE, cent.z * COORD_SCALE);
      centroidGroup.add(coreMesh);

      // Centroid Inner Luminous Core
      const dotGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.set(cent.x * COORD_SCALE, cent.y * COORD_SCALE, cent.z * COORD_SCALE);
      centroidGroup.add(dotMesh);

      // Orbital Gravitational Ring
      const ringGeo = new THREE.RingGeometry(1.2, 1.35, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(cent.x * COORD_SCALE, cent.y * COORD_SCALE, cent.z * COORD_SCALE);
      ring.rotation.x = Math.PI / 3;
      centroidGroup.add(ring);
    });
    scene.add(centroidGroup);

    // Gravitational Constellation Filament Links
    let constellationGroup: THREE.Group | null = null;
    if (showConstellations && centroids.length > 0) {
      constellationGroup = new THREE.Group();
      const linePositions: number[] = [];
      const lineColors: number[] = [];
      const palette = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];

      centroids.forEach((cent: any) => {
        if (isolatedCluster !== null && cent.cluster !== isolatedCluster) return;
        const cColor = new THREE.Color(palette[cent.cluster % palette.length]);
        const cx = cent.x * COORD_SCALE;
        const cy = cent.y * COORD_SCALE;
        const cz = cent.z * COORD_SCALE;

        const clusterPoints = points
          .filter((p: any) => p.Cluster === cent.cluster)
          .slice(0, 18);

        clusterPoints.forEach((p: any) => {
          linePositions.push(cx, cy, cz);
          linePositions.push(p.PCA_1 * COORD_SCALE, p.PCA_2 * COORD_SCALE, p.PCA_3 * COORD_SCALE);
          lineColors.push(cColor.r, cColor.g, cColor.b);
          lineColors.push(cColor.r * 0.35, cColor.g * 0.35, cColor.b * 0.35);
        });
      });

      if (linePositions.length > 0) {
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
        const lineMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.22,
          blending: THREE.NormalBlending,
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        constellationGroup.add(lines);
      }
      scene.add(constellationGroup);
    }

    // Selected Customer Targeting Reticle
    const selectedReticle = new THREE.Group();
    const rGeo = new THREE.RingGeometry(0.7, 0.85, 32);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    selectedReticle.add(rMesh);

    const crossGeo = new THREE.BufferGeometry();
    const crossPos = new Float32Array([
      -1.1, 0, 0, 1.1, 0, 0,
      0, -1.1, 0, 0, 1.1, 0,
    ]);
    crossGeo.setAttribute('position', new THREE.BufferAttribute(crossPos, 3));
    const crossMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const cross = new THREE.LineSegments(crossGeo, crossMat);
    selectedReticle.add(cross);
    selectedReticle.visible = false;
    scene.add(selectedReticle);

    if (selectedPoint) {
      selectedReticle.position.set(
        (selectedPoint.PCA_1 || 0) * COORD_SCALE,
        (selectedPoint.PCA_2 || 0) * COORD_SCALE,
        (selectedPoint.PCA_3 || 0) * COORD_SCALE
      );
      selectedReticle.visible = true;
    }

    // Coordinate Grid Ring (Galactic Equator)
    const gridHelper = new THREE.GridHelper(36, 36, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -14;
    scene.add(gridHelper);

    // Interactive Raycaster for Hover & Selection
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.35;
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(particleSystem);
      if (intersects.length > 0) {
        const idx = intersects[0].index;
        if (idx !== undefined && points[idx]) {
          setHoveredPoint(points[idx]);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredPoint(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(particleSystem);
      if (intersects.length > 0) {
        const idx = intersects[0].index;
        if (idx !== undefined && points[idx]) {
          setSelectedPoint(points[idx]);
          selectedReticle.position.set(
            points[idx].PCA_1 * COORD_SCALE,
            points[idx].PCA_2 * COORD_SCALE,
            points[idx].PCA_3 * COORD_SCALE
          );
          selectedReticle.visible = true;
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // Drag & Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMoveDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      particleSystem.rotation.y += deltaX * 0.005;
      particleSystem.rotation.x += deltaY * 0.005;
      centroidGroup.rotation.y += deltaX * 0.005;
      centroidGroup.rotation.x += deltaY * 0.005;
      if (constellationGroup) {
        constellationGroup.rotation.y += deltaX * 0.005;
        constellationGroup.rotation.x += deltaY * 0.005;
      }
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(10, Math.min(60, camera.position.z + e.deltaY * 0.035));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMoveDrag);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDragging) {
        particleSystem.rotation.y += delta * 0.12 * rotateSpeed;
        centroidGroup.rotation.y += delta * 0.12 * rotateSpeed;
        if (constellationGroup) {
          constellationGroup.rotation.y += delta * 0.12 * rotateSpeed;
        }
        stars.rotation.y -= delta * 0.015 * rotateSpeed;
      }

      // Rotate centroid beacon octahedrons & pulse rings
      centroidGroup.children.forEach((child: any) => {
        if (child.geometry instanceof THREE.RingGeometry) {
          child.rotation.z += delta * 0.6;
        } else if (child.geometry instanceof THREE.OctahedronGeometry) {
          child.rotation.y += delta * 1.2;
          child.rotation.x += delta * 0.8;
        }
      });

      // Selected reticle billboard spin
      if (selectedReticle && selectedReticle.visible) {
        selectedReticle.lookAt(camera.position);
        selectedReticle.rotation.z += delta * 1.5;
      }

      renderer.render(scene, camera);
    };

    animate();

    threeStateRef.current = {
      scene,
      camera,
      renderer,
      particleSystem,
      centroidGroup,
      setCameraPreset: (preset: string) => {
        if (preset === 'top') {
          camera.position.set(0, 36, 0.1);
          camera.lookAt(0, 0, 0);
        } else if (preset === 'side') {
          camera.position.set(36, 0, 0);
          camera.lookAt(0, 0, 0);
        } else {
          camera.position.set(0, 10, 26);
          camera.lookAt(0, 0, 0);
        }
      },
    };

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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', onMouseUp);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [galaxyData, colorBy, particleSize, isolatedCluster, autoRotate, rotateSpeed, showConstellations, renderEngine]);

  // ==========================================
  // PLOTLY 3D SCATTER FALLBACK / DUAL MODE
  // ==========================================
  useEffect(() => {
    if (renderEngine !== 'plotly' || !galaxyData || !galaxyData.points || !plotlyContainerRef.current || !window.Plotly) return;

    const points = galaxyData.points;
    const x = points.map((p: any) => p.PCA_1);
    const y = points.map((p: any) => p.PCA_2);
    const z = points.map((p: any) => p.PCA_3);

    let markerColors = [];
    if (colorBy === 'Cluster') {
      const palette = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];
      markerColors = points.map((p: any) => palette[p.Cluster % palette.length]);
    } else if (colorBy === 'Geography') {
      markerColors = points.map((p: any) => (p.Geography === 'Germany' ? '#f43f5e' : p.Geography === 'France' ? '#38bdf8' : '#f59e0b'));
    } else if (colorBy === 'Exited') {
      markerColors = points.map((p: any) => (p.Exited === 1 ? '#f43f5e' : '#10b981'));
    } else {
      markerColors = points.map((p: any) => p.Balance);
    }

    const hoverText = points.map((p: any) =>
      `<b>${p.Cluster_Name}</b><br>ID: #${p.CustomerId}<br>Country: ${p.Geography}<br>Age: ${p.Age}<br>Balance: €${p.Balance.toLocaleString()}<br>Products: ${p.NumOfProducts}<br>Outcome: ${p.Exited === 1 ? 'CHURNED' : 'RETAINED'}`
    );

    const trace = {
      x,
      y,
      z,
      mode: 'markers',
      type: 'scatter3d',
      text: hoverText,
      hoverinfo: 'text',
      marker: {
        size: 3.5,
        color: markerColors,
        opacity: 0.85,
        line: { width: 0.5, color: '#ffffff' },
      },
    };

    const layout = {
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      scene: {
        xaxis: { title: 'PCA Component 1', color: '#94a3b8', gridcolor: '#1e293b' },
        yaxis: { title: 'PCA Component 2', color: '#94a3b8', gridcolor: '#1e293b' },
        zaxis: { title: 'PCA Component 3', color: '#94a3b8', gridcolor: '#1e293b' },
        camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
      },
    };

    window.Plotly.newPlot(plotlyContainerRef.current, [trace], layout, { responsive: true, displayModeBar: false });
    plotlyContainerRef.current.on('plotly_click', (data: any) => {
      if (data && data.points && data.points.length > 0) {
        const pointIdx = data.points[0].pointNumber;
        setSelectedPoint(points[pointIdx]);
      }
    });
  }, [galaxyData, colorBy, renderEngine]);

  const handleCameraPreset = (preset: 'iso' | 'top' | 'side') => {
    if (threeStateRef.current.setCameraPreset) {
      threeStateRef.current.setCameraPreset(preset);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 p-6 space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Orbit className="w-5 h-5 text-sky-400 animate-spin-slow" />
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              3D Customer Segmentation Galaxy
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {renderEngine === 'threejs' ? 'Three.js Cosmic WebGL' : 'Plotly 3D High-Res'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Orthogonal principal component projection mapping {(galaxyData?.total_points || 10000).toLocaleString()} customers in continuous 3D coordinate space.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Engine Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setRenderEngine('threejs')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                renderEngine === 'threejs' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WebGL Galaxy
            </button>
            <button
              onClick={() => setRenderEngine('plotly')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                renderEngine === 'plotly' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plotly 3D
            </button>
          </div>

          {/* Algorithm */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Algo:</span>
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="kmeans">K-Means</option>
              <option value="gmm">Gaussian Mixture</option>
              <option value="agglomerative">Agglomerative</option>
            </select>
          </div>

          {/* Clusters k */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">k:</span>
            <select
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>{num} Clusters</option>
              ))}
            </select>
          </div>

          {/* Color Dimension */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Color:</span>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="Cluster">Cluster Persona</option>
              <option value="Geography">Sovereign Country</option>
              <option value="Exited">Churn Outcome</option>
              <option value="IsActiveMember">Digital Engagement</option>
              <option value="Balance">Account Wealth Scale</option>
            </select>
          </div>

          {/* Particle Size */}
          {renderEngine === 'threejs' && (
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">Node Size:</span>
              <input
                type="range"
                min="0.15"
                max="0.80"
                step="0.05"
                value={particleSize}
                onChange={(e) => setParticleSize(parseFloat(e.target.value))}
                className="w-16 accent-sky-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 w-6">{particleSize.toFixed(2)}</span>
            </div>
          )}

          {/* Constellations Filament Toggle */}
          {renderEngine === 'threejs' && (
            <button
              onClick={() => setShowConstellations(!showConstellations)}
              className={`px-2.5 py-1 rounded-lg font-medium text-xs transition border flex items-center gap-1.5 ${
                showConstellations
                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
              title="Toggle Gravitational Constellation Links"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Links: {showConstellations ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchGalaxy}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Recalculate Projections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cluster Persona Filter Badges Toolbar */}
      {galaxyData && galaxyData.centroids_3d && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Isolate:
          </span>
          <button
            onClick={() => setIsolatedCluster(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              isolatedCluster === null ? 'bg-sky-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Constellations
          </button>
          {galaxyData.centroids_3d.map((cent: any) => {
            const palette = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4'];
            const cColor = palette[cent.cluster % palette.length];
            const isSelected = isolatedCluster === cent.cluster;
            return (
              <button
                key={cent.cluster}
                onClick={() => setIsolatedCluster(isSelected ? null : cent.cluster)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-white font-bold border-sky-400 shadow-sm'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cColor }} />
                <span>{cent.cluster_name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({cent.account_count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main 3D Viewport with Floating HUD & Bottom Dock */}
      <div className="flex-1 relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <Orbit className="w-10 h-10 text-sky-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-200">Synthesizing 3D Cosmic Projection...</p>
            <p className="text-xs text-slate-400">Computing WebGL particle buffers for European customer galaxy</p>
          </div>
        )}

        {/* Camera Preset Floating Controls (Three.js mode only) */}
        {renderEngine === 'threejs' && (
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md text-xs">
            <span className="text-slate-400 px-1 font-mono text-[11px]">Camera:</span>
            <button
              onClick={() => handleCameraPreset('iso')}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px]"
            >
              Isometric
            </button>
            <button
              onClick={() => handleCameraPreset('top')}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px]"
            >
              Top-Down
            </button>
            <button
              onClick={() => handleCameraPreset('side')}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px]"
            >
              Side-Plane
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1 rounded transition ${
                autoRotate ? 'text-sky-400 hover:text-sky-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={autoRotate ? 'Pause Orbit' : 'Resume Orbit'}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Floating Holographic Hover HUD */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none p-3 rounded-xl bg-slate-900/90 border border-sky-500/40 backdrop-blur-md shadow-2xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white">#{hoveredPoint.CustomerId}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  hoveredPoint.Exited === 1 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {hoveredPoint.Exited === 1 ? 'CHURN RISK' : 'RETAINED'}
              </span>
            </div>
            <div className="font-mono text-slate-300 text-[11px] space-y-0.5">
              <div>Country: <span className="text-white font-semibold">{hoveredPoint.Geography}</span></div>
              <div>Balance: <span className="text-sky-400 font-semibold">€{hoveredPoint.Balance?.toLocaleString()}</span></div>
              <div>Products: <span className="text-white">{hoveredPoint.NumOfProducts}</span></div>
              <div>Age: <span className="text-white">{hoveredPoint.Age} yrs</span></div>
            </div>
            <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
              Click node to pin in telemetry dock
            </div>
          </div>
        )}

        {/* 3D Viewport Containers */}
        {renderEngine === 'threejs' ? (
          <div ref={mountRef} className="flex-1 w-full h-full min-h-[420px]" />
        ) : (
          <div ref={plotlyContainerRef} className="flex-1 w-full h-full min-h-[420px]" />
        )}

        {/* Bottom Selected Customer Telemetry Dock */}
        {selectedPoint && (
          <div className="p-4 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">
                    {selectedPoint.Surname || 'Customer'} #{selectedPoint.CustomerId}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    {selectedPoint.Cluster_Name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedPoint.Exited === 1
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {selectedPoint.Exited === 1 ? 'CHURNED ACCOUNT' : 'ACTIVE / RETAINED'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                  <span>Territory: <strong className="text-slate-200">{selectedPoint.Geography}</strong></span>
                  <span>Age: <strong className="text-slate-200">{selectedPoint.Age} yrs</strong></span>
                  <span>Balance: <strong className="text-emerald-400">€{selectedPoint.Balance?.toLocaleString()}</strong></span>
                  <span>Products: <strong className={selectedPoint.NumOfProducts >= 3 ? 'text-rose-400' : 'text-slate-200'}>{selectedPoint.NumOfProducts}</strong></span>
                  <span>Tenure: <strong className="text-slate-200">{selectedPoint.Tenure || 3} yrs</strong></span>
                </div>
              </div>
            </div>

            {/* 3D Coordinate Telemetry */}
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                PCA 1: <span className="text-sky-400">{selectedPoint.PCA_1?.toFixed(3)}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                PCA 2: <span className="text-purple-400">{selectedPoint.PCA_2?.toFixed(3)}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                PCA 3: <span className="text-emerald-400">{selectedPoint.PCA_3?.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
