import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const MiniClusterCube: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 100;
    const height = container.clientHeight || 100;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(2.8, 2.2, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Wireframe Bounding Box
    const boxSize = 1.6;
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const wireframeBox = new THREE.LineSegments(edgesGeo, edgesMat);
    scene.add(wireframeBox);

    // Axis indicator grid corners
    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    // 5 Distinct Cluster Centers & Colors matching reference
    const clusters = [
      { center: [-0.45, 0.4, 0.3], color: 0x22d3ee, count: 18 },  // Cluster 1 (Cyan)
      { center: [0.45, 0.45, -0.3], color: 0x3b82f6, count: 20 }, // Cluster 2 (Blue)
      { center: [-0.4, -0.35, -0.3], color: 0x10b981, count: 16 },// Cluster 3 (Green)
      { center: [0.4, -0.4, 0.35], color: 0xa855f7, count: 22 },  // Cluster 4 (Purple)
      { center: [0.0, 0.05, 0.0], color: 0xf97316, count: 18 },   // Cluster 5 (Orange)
    ];

    clusters.forEach((c) => {
      const positions = new Float32Array(c.count * 3);
      for (let i = 0; i < c.count; i++) {
        positions[i * 3] = c.center[0] + (Math.random() - 0.5) * 0.32;
        positions[i * 3 + 1] = c.center[1] + (Math.random() - 0.5) * 0.32;
        positions[i * 3 + 2] = c.center[2] + (Math.random() - 0.5) * 0.32;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: c.color,
        size: 0.075,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geo, mat);
      clusterGroup.add(points);
    });

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      wireframeBox.rotation.y = elapsed * 0.35;
      wireframeBox.rotation.x = Math.sin(elapsed * 0.2) * 0.15;
      clusterGroup.rotation.y = elapsed * 0.35;
      clusterGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.15;
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
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      boxGeo.dispose();
      edgesGeo.dispose();
      edgesMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={`w-24 h-24 relative ${className}`} />;
};
