import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const AvatarViewer = ({ profile, selectedClothes }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarGroupRef = useRef(new THREE.Group());

  const getClothingColor = useCallback((id) => {
    const map = {
      't-shirt-white': 0xffffff,
      't-shirt-black': 0x111827,
      't-shirt-red': 0xdc2626,
      'jeans-blue': 0x2563eb,
      'jeans-black': 0x1f2937,
      'shorts-khaki': 0xb45309,
      'sneakers-black': 0x111827,
      'sneakers-white': 0xffffff,
      'boots-brown': 0x92400e,
    };
    return map[id] || 0xcccccc;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(2, 5, 3);
    scene.add(directionalLight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(avatarGroupRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current) {
        // Remove the renderer DOM element safely
        if (containerRef.current && rendererRef.current.domElement) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current.context = null;
        rendererRef.current.domElement = null;
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      avatarGroupRef.current = new THREE.Group();
    };
  }, []);

  // --- Update Avatar Mesh ---
  useEffect(() => {
    const group = avatarGroupRef.current;
    if (!group || !profile) return;

    group.clear();

    const bodyHeight = profile.height * 0.6;
    const bodyWidth = 0.4;
    const bodyY = profile.height / 2;

    // Body
    const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyWidth * 0.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = bodyY - 0.05;
    group.add(bodyMesh);

    // Top
    const topGeo = new THREE.BoxGeometry(bodyWidth * 1.1, bodyHeight * 0.6, bodyWidth * 0.55);
    const topMat = new THREE.MeshLambertMaterial({ color: getClothingColor(selectedClothes.top) });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = bodyY + bodyHeight * 0.2;
    group.add(topMesh);

    // Bottom
    const bottomGeo = new THREE.BoxGeometry(bodyWidth * 1.05, bodyHeight * 0.4, bodyWidth * 0.5);
    const bottomMat = new THREE.MeshLambertMaterial({ color: getClothingColor(selectedClothes.bottom) });
    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
    bottomMesh.position.y = bodyY - bodyHeight * 0.4;
    group.add(bottomMesh);

    // Head
    const headRadius = profile.height * 0.08;
    const headGeo = new THREE.SphereGeometry(headRadius, 32, 16);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = bodyY + bodyHeight / 2 + headRadius * 0.8;
    group.add(headMesh);

    // Camera adjustment
    if (cameraRef.current) {
      cameraRef.current.position.y = bodyY;
      cameraRef.current.position.z = Math.max(2.5, profile.height * 1.5);
    }
  }, [profile, selectedClothes, getClothingColor]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] bg-gray-100 rounded-xl shadow-inner"
    />
  );
};

export default AvatarViewer;
