import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MinusCircle, PlusCircle, User, Ruler, Maximize2 } from 'lucide-react';

// --- COLOR MAPPING FOR THREE.js ---
// Three.js requires standard hex codes, not Tailwind classes.
const TAILWIND_TO_HEX = {
  'bg-white': '#ffffff',
  'bg-gray-900': '#111827', // Black
  'bg-red-600': '#dc2626',
  'bg-blue-600': '#2563eb',
  'bg-gray-800': '#1f2937',
  'bg-yellow-700': '#b45309', // Khaki/Mustard
  'bg-amber-800': '#9a3412', // Brown/Boots
  'bg-gray-400': '#9ca3af', // Default fallback gray
};

// --- MOCK DATA & SERVICES (Replaced API calls to prevent connection errors) ---

// Mock User ID
const PROTOTYPE_USER_ID = 'u4321';

// Mock Profile Structure - FORCING DISTINCT COLORS TO VERIFY RENDERING
const MOCK_PROFILE = {
  id: PROTOTYPE_USER_ID,
  name: "User Avatar",
  height: 1.71, // Using 1.71m as per the screenshot
  bodyType: "Average",
  selectedClothes: {
    top: 't-shirt-red',     // Should be RED
    bottom: 'shorts-khaki', // Should be KHAKI/BROWN
    shoes: 'boots-brown',   // Should be BROWN
  }
};

// Mock Catalog: 'color' stores the Tailwind class for the UI buttons
const CLOTHING_CATALOG = [
  { id: 't-shirt-white', category: 'top', color: 'bg-white', name: 'White T-Shirt' },
  { id: 't-shirt-black', category: 'top', color: 'bg-gray-900', name: 'Black T-Shirt' },
  { id: 't-shirt-red', category: 'top', color: 'bg-red-600', name: 'Red T-Shirt' },
  { id: 'jeans-blue', category: 'bottom', color: 'bg-blue-600', name: 'Blue Jeans' },
  { id: 'jeans-black', category: 'bottom', color: 'bg-gray-800', name: 'Black Jeans' },
  { id: 'shorts-khaki', category: 'bottom', color: 'bg-yellow-700', name: 'Khaki Shorts' },
  { id: 'sneakers-black', category: 'shoes', color: 'bg-gray-900', name: 'Black Sneakers' },
  { id: 'sneakers-white', category: 'shoes', color: 'bg-white', name: 'White Sneakers' },
  { id: 'boots-brown', category: 'shoes', color: 'bg-amber-800', name: 'Brown Boots' },
];

const mockGetProfile = async (userId) => {
  console.log(`[Mock Service] Fetching profile for ${userId}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return MOCK_PROFILE;
};

const mockGetCatalog = async () => {
  console.log('[Mock Service] Fetching clothing catalog');
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  return CLOTHING_CATALOG;
};

// --- AVATAR VIEWER COMPONENT (THREE.js Rendering) ---

const AvatarViewer = ({ profile, selectedClothes }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null); // Reference for OrbitControls
  const avatarGroupRef = useRef(new THREE.Group()); // Holds the avatar body and clothes
  const animationFrameIdRef = useRef(null); // Ref for animation frame ID

  // Function to safely convert Tailwind class to Hex for Three.js
  const getClothingItemColor = useCallback((id) => {
    const item = CLOTHING_CATALOG.find(c => c.id === id);
    const tailwindClass = item ? item.color : 'bg-gray-400';
    // Use the map to get the correct hex code, defaulting to a mid-gray if missing
    return TAILWIND_TO_HEX[tailwindClass] || '#9ca3af';
  }, []);

  // 1. INITIAL SCENE SETUP
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure the scene is initialized only once
    if (sceneRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    scene.add(avatarGroupRef.current);

    // Camera
    const initialWidth = container.clientWidth || 400;
    const initialHeight = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(75, initialWidth / initialHeight, 0.1, 1000);
    // Initial camera position and target centered on avatar height
    const targetY = profile.height / 2;
    camera.position.set(0, targetY, profile.height * 1.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(2, 5, 3);
    scene.add(directionalLight);

    // Ground Plane for visual anchoring
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, targetY, 0); // Target center of avatar
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Append renderer to DOM
    container.appendChild(renderer.domElement);

    // Animation Loop
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current); // Stop animation loop

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Clear refs to allow re-initialization if component is unmounted and remounted
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      avatarGroupRef.current.clear();
    };
  }, [profile.height]); // profile.height is crucial for initial camera setup

  // 2. AVATAR MESH UPDATE (Responds to profile and clothing changes)
  useEffect(() => {
    if (!avatarGroupRef.current) return;

    // Clear previous meshes
    while (avatarGroupRef.current.children.length > 0) {
      const mesh = avatarGroupRef.current.children[0];
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
      avatarGroupRef.current.remove(mesh);
    }

    const height = profile.height; // Avatar total height (e.g., 1.71m)
    const bodyWidth = height * 0.2; // Base width for body parts, relative to height

    // Define segment heights based on total height
    const headProportion = 0.1; // Head accounts for ~10% of total height
    const headRadius = height * headProportion / 2;

    // Remaining height for body segments (Torso, Bottom, Shoes)
    const remainingHeight = height - (headRadius * 2);

    const shoeHeight = remainingHeight * 0.05; // 5% of remaining height
    const topHeight = remainingHeight * 0.40;  // 40% of remaining height
    const bottomHeight = remainingHeight * 0.55; // 55% of remaining height

    const neckHeight = 0.05 * headRadius; // Small neck spacer

    // Calculate vertical center points for stacking from Y=0 (the ground plane)
    let currentY = 0; // The top of the previous segment

    // --- 1. Simplified Feet/Shoes ---
    currentY += shoeHeight / 2;
    const shoeGeo = new THREE.BoxGeometry(bodyWidth * 0.6, shoeHeight, bodyWidth * 0.8);
    const shoeMat = new THREE.MeshLambertMaterial({ color: getClothingItemColor(selectedClothes.shoes) });

    // Left Shoe
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-bodyWidth * 0.25, currentY, 0);
    avatarGroupRef.current.add(leftShoe);

    // Right Shoe
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(bodyWidth * 0.25, currentY, 0);
    avatarGroupRef.current.add(rightShoe);

    // --- 2. Bottom Clothing (Pants/Shorts) ---
    currentY += shoeHeight / 2 + bottomHeight / 2;
    const bottomGeo = new THREE.BoxGeometry(bodyWidth * 1.05, bottomHeight, bodyWidth * 0.45);
    const bottomMat = new THREE.MeshLambertMaterial({ color: getClothingItemColor(selectedClothes.bottom) });
    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
    bottomMesh.position.y = currentY;
    avatarGroupRef.current.add(bottomMesh);

    // --- 3. Top Clothing (Shirt/Jacket) ---
    currentY += bottomHeight / 2 + topHeight / 2;
    const topGeo = new THREE.BoxGeometry(bodyWidth * 1.1, topHeight, bodyWidth * 0.45);
    const topMat = new THREE.MeshLambertMaterial({ color: getClothingItemColor(selectedClothes.top) });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = currentY;
    avatarGroupRef.current.add(topMesh);

    // --- 4. Neck/Torso Spacer (Invisible Skin) ---
    currentY += topHeight / 2 + neckHeight / 2;
    const neckGeo = new THREE.BoxGeometry(bodyWidth * 0.3, neckHeight, bodyWidth * 0.3);
    const neckMat = new THREE.MeshLambertMaterial({ color: 0xffdbac }); // Fixed skin tone color
    const neckMesh = new THREE.Mesh(neckGeo, neckMat);
    neckMesh.position.y = currentY;
    avatarGroupRef.current.add(neckMesh);

    // --- 5. Head ---
    currentY += neckHeight / 2 + headRadius;
    const headGeo = new THREE.SphereGeometry(headRadius, 32, 16);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xffdbac }); // Fixed skin tone color
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = currentY;
    avatarGroupRef.current.add(headMesh);


    // Adjust Camera target on update
    if (controlsRef.current) {
      const targetY = height / 2;
      // Only update target if it needs adjustment (e.g., height changed)
      if (controlsRef.current.target.y !== targetY) {
        controlsRef.current.target.set(0, targetY, 0);
        controlsRef.current.update();
      }
    }


  }, [profile.height, selectedClothes, getClothingItemColor]);


  return <div ref={containerRef} className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg shadow-inner" />;
};


// --- AVATAR PAGE COMPONENT (State & Controls) ---

const AvatarPage = () => {
  const [profile, setProfile] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'clothing'

  // Group the catalog by category for easy display
  const clothingByCategory = useMemo(() => {
    return catalog.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {});
  }, [catalog]);

  // Initial data fetch (using mock services)
  useEffect(() => {
    const initializeData = async () => {
      try {
        const fetchedProfile = await mockGetProfile(PROTOTYPE_USER_ID);
        const fetchedCatalog = await mockGetCatalog();

        setProfile(fetchedProfile);
        setCatalog(fetchedCatalog);
      } catch (error) {
        console.error("Failed to initialize data:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Handlers
  const handleHeightChange = useCallback((delta) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newHeight = parseFloat((prev.height + delta).toFixed(2));
      // Bounds: 1.0m to 2.5m
      if (newHeight >= 1.0 && newHeight <= 2.5) {
        return { ...prev, height: newHeight };
      }
      return prev;
    });
  }, []);

  const handleBodyTypeChange = useCallback((newType) => {
    setProfile(prev => prev ? { ...prev, bodyType: newType } : prev);
  }, []);

  const handleClothingSelect = useCallback((category, itemId) => {
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedClothes: {
          ...prev.selectedClothes,
          [category]: itemId,
        }
      };
    });
  }, []);

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-600 animate-pulse">Loading Avatar Studio...</div>
      </div>
    );
  }

  // --- SUB-COMPONENTS ---

  const ProfileControls = () => (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center">
        <Ruler className="w-5 h-5 mr-2 text-indigo-500" />
        Physical Profile
      </h3>

      {/* Height Control */}
      <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100">
        <label className="block text-sm font-medium text-gray-500 mb-2">Height (Meters)</label>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-800">{profile.height.toFixed(2)}m</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleHeightChange(-0.01)}
              className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
              title="Decrease Height by 1cm"
            >
              <MinusCircle className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleHeightChange(0.01)}
              className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition"
              title="Increase Height by 1cm"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Body Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-500">Body Type</label>
        <div className="flex flex-wrap gap-2">
          {['Ectomorph', 'Mesomorph', 'Endomorph'].map(type => (
            <button
              key={type}
              onClick={() => handleBodyTypeChange(type)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${profile.bodyType === type
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ClothingControls = () => (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center">
        <User className="w-5 h-5 mr-2 text-indigo-500" />
        Outfit Customization
      </h3>

      {['top', 'bottom', 'shoes'].map(category => (
        <div key={category} className="space-y-3 bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <label className="block text-md font-semibold text-gray-700 capitalize">{category}</label>
          <div className="flex flex-wrap gap-3">
            {clothingByCategory[category]?.map(item => (
              <button
                key={item.id}
                onClick={() => handleClothingSelect(category, item.id)}
                // item.color contains the Tailwind class (e.g., 'bg-white'), which works for the UI button
                className={`w-12 h-12 rounded-full border-4 transition-all duration-150 relative ${item.color} ${profile.selectedClothes[category] === item.id
                    ? 'border-indigo-500 shadow-xl scale-110'
                    : 'border-gray-300 hover:border-indigo-300'
                  }`}
                title={item.name}
              >
                {/* Optional: add a tiny checkmark if selected, but color speaks for itself */}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );


  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50 font-sans overflow-hidden">
      {/* Control Panel (Left/Top) */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-auto md:h-full overflow-y-auto bg-white shadow-xl">
        <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1 className="text-2xl font-extrabold text-indigo-700">Avatar Studio</h1>
          <p className="text-sm text-gray-500 mt-1">Customize your profile and clothing</p>
          <div className="flex mt-4 space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('clothing')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'clothing'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Clothing
            </button>
          </div>
        </header>

        <main className="pb-8">
          {activeTab === 'profile' && <ProfileControls />}
          {activeTab === 'clothing' && <ClothingControls />}
        </main>
      </div>

      {/* 3D Viewer (Right/Bottom) */}
      <div className="w-full md:w-2/3 lg:w-3/4 p-4 md:p-8 flex flex-col items-center justify-center relative">
        <div className="w-full h-full max-w-4xl max-h-[80vh] relative">
          <AvatarViewer profile={profile} selectedClothes={profile.selectedClothes} />
          <div className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 text-white text-xs rounded-lg flex items-center">
            <Maximize2 className="w-3 h-3 mr-1" /> 3D View (Orbit Control Enabled)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
