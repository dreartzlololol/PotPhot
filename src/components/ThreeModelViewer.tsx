import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type { EquippedDecal, DrawingStroke } from './PotMiniGame';

interface ThreeModelViewerProps {
  fileData: string | null;
  fileType: 'stl' | 'obj' | null;
  shapeId: string;
  clayId: string;
  potWidth: number;
  potHeight: number;
  rimScale: number;
  baseScale: number;
  potScale?: number;
  useCustomClayColor: boolean;
  clayColor1: string;
  clayColor2: string;
  clayGrainLevel?: number;
  glazeId: string;
  useCustomGlazeColor: boolean;
  customGlazeColor: string;
  glazeOpacity: number;
  glazeGlossyLevel: number;
  glazeMetallicLevel: number;
  finishType: 'matte' | 'glossy' | 'crackled';
  spinSpeed: number;
  equippedDecals: EquippedDecal[];
  decorations?: Set<string>;
  selectedDecalId: string | null;
  onSelectDecal: (id: string | null) => void;
  onUpdateDecal?: (id: string, updates: Partial<EquippedDecal>) => void;
  engravedText: string;
  engravingColor: string;
  referenceObject?: 'none' | 'iphone' | 'can' | 'coin';
  refObjectX?: number;
  refObjectZ?: number;
  refObjectRotation?: number;
  showAxes?: boolean;
  isDrawingMode?: boolean;
  drawingPaths?: DrawingStroke[];
  onDrawStroke?: (x: number, y: number, isNewStroke: boolean) => void;
  brushColor?: string;
  brushSize?: number;
}

function dataURLToArrayBuffer(dataURL: string): ArrayBuffer {
  const base64 = dataURL.split(',')[1];
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getClayColorHex(clayId: string): string {
  switch (clayId) {
    case 'terracotta': return '#CD853F';
    case 'stoneware': return '#616161';
    case 'porcelain': return '#E0E0E0';
    case 'raku': return '#E65100';
    default: return '#CD853F';
  }
}

function getGlazeColorHex(glazeId: string): string {
  switch (glazeId) {
    case 'amber': return '#FFB432';
    case 'cobalt': return '#1950C8';
    case 'emerald': return '#148C50';
    case 'ruby': return '#C81E3C';
    case 'smoke': return '#3C3C3C';
    case 'pearl': return '#DCF0FF';
    case 'gold': return '#FFD200';
    default: return '#FFFFFF';
  }
}

export function getDecalSVGDataURL(decalId: string): string {
  if (decalId === 'body-dragon') return '/chinese_dragon_pattern.png';
  if (decalId === 'body-koi-pair') return '/koi_pattern.png';
  
  let svgString = '';
  switch (decalId) {
    case 'body-pot-dragon':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 10 70 Q 25 55 40 70 T 70 70" fill="none" stroke="#FFA000" stroke-width="2" />
        <path d="M 18 78 C 10 50, 32 28, 56 28 C 76 28, 86 46, 80 68 C 74 84, 46 84, 32 75 Z" fill="#E65100" />
        <path d="M 24 72 C 18 52, 34 35, 56 35 C 72 35, 79 48, 74 65 C 70 76, 48 76, 35 70 Z" fill="#FF8F00" />
        <path d="M 30 65 C 26 55, 38 43, 56 43 C 67 43, 72 52, 68 63 C 64 70, 48 70, 38 65 Z" fill="#FFD54F" />
        <path d="M 35 35 Q 42 45 50 35 T 65 35" fill="none" stroke="#B71C1C" stroke-width="2" stroke-linecap="round" />
        <circle cx="76" cy="32" r="8" fill="#FF3D00" />
        <circle cx="76" cy="32" r="5" fill="#FF9100" />
        <circle cx="76" cy="32" r="2.5" fill="#FFF9C4" />
        <path d="M 68 32 Q 58 22 48 28 Q 60 36 68 32 Z" fill="#FF9100" />
        <path d="M 75 40 Q 86 52 94 45" fill="none" stroke="#FFE082" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="68" cy="38" r="2.5" fill="#B71C1C" />
      </svg>`;
      break;
    case 'body-dragon':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 25 65 C 20 50, 30 35, 45 35 C 55 35, 60 45, 65 42 C 72 38, 70 25, 82 28 C 88 30, 85 45, 75 48 C 65 52, 55 68, 42 68 C 30 68, 28 58, 25 65 Z" fill="#FFB300"/>
        <path d="M 45,35 Q 38,40 38,48 T 50,55 T 62,48" fill="none" stroke="#FFF59D" stroke-width="3" stroke-linecap="round"/>
        <path d="M 68,35 Q 60,30 55,20 Q 52,32 68,35 Z" fill="#FF8F00"/>
        <circle cx="74" cy="35" r="3" fill="#E63946"/>
      </svg>`;
      break;
    case 'body-benjarong':
      return '/benjarong_cropped.png';
    case 'body-kranok-flame':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 20 80 Q 30 40, 50 30 Q 35 45, 30 70 Z" fill="#FFB300" />
        <path d="M 30 70 Q 45 25, 75 15 Q 55 35, 45 65 Z" fill="#FF8F00" />
        <path d="M 45 65 Q 65 30, 85 20 Q 70 45, 60 75 Z" fill="#E65100" />
        <path d="M 20 80 C 40 85, 70 85, 80 75 Z" fill="#D84315" />
      </svg>`;
      break;
    case 'body-lotus':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 15 55 C 10 70, 90 70, 85 55 C 70 50, 30 50, 15 55 Z" fill="#1B5E20"/>
        <path d="M 22 56 C 18 68, 82 68, 78 56 C 65 52, 35 52, 22 56 Z" fill="#2E7D32"/>
        <path d="M 50 20 C 40 40, 25 58, 50 68 C 75 58, 60 40, 50 20 Z" fill="#D81B60"/>
        <path d="M 50 30 C 38 45, 30 58, 50 68 C 70 58, 62 45, 50 30 Z" fill="#E91E63"/>
        <path d="M 50 40 C 43 50, 38 60, 50 68 C 62 60, 57 50, 50 40 Z" fill="#F48FB1"/>
        <circle cx="50" cy="58" r="5" fill="#FBC02D"/>
      </svg>`;
      break;
    case 'body-phoenix':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 12 45 Q 32 15, 55 25 Q 40 38, 12 45 Z" fill="#FF8F00"/>
        <path d="M 12 55 Q 28 68, 50 58 Q 38 48, 12 55 Z" fill="#D84315"/>
        <path d="M 55 25 C 60 20, 72 20, 75 28 C 70 32, 62 30, 57 30 Z" fill="#FBC02D"/>
        <path d="M 28 60 Q 42 85, 68 88 Q 48 76, 28 60 Z" fill="#FF8F00"/>
      </svg>`;
      break;
    case 'body-bamboo':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <rect x="35" y="15" width="8" height="70" rx="3" fill="#2E7D32"/>
        <rect x="55" y="32" width="7" height="53" rx="3" fill="#388E3C"/>
        <path d="M 38 30 Q 20 20, 10 30 Q 25 35, 38 30 Z" fill="#4CAF50"/>
        <path d="M 58 45 Q 75 35, 88 45 Q 70 50, 58 45 Z" fill="#4CAF50"/>
      </svg>`;
      break;

    case 'body-crane-clouds':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 20 60 Q 40 30, 65 35 Q 50 50, 20 60 Z" fill="#FFF" />
        <path d="M 65 35 Q 75 20, 80 22 C 78 28, 70 32, 65 35 Z" fill="#E63946" />
        <path d="M 35 52 L 40 85 L 36 85 Z" fill="#212121" />
        <path d="M 42 50 L 50 82 L 46 82 Z" fill="#212121" />
        <path d="M 10 75 C 15 65, 35 65, 45 75 C 55 65, 75 65, 85 75" fill="none" stroke="#FFD54F" stroke-width="3" stroke-linecap="round" />
      </svg>`;
      break;
    case 'body-cherry-blossom':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <path d="M 15 80 Q 45 60, 85 30" fill="none" stroke="#5D4037" stroke-width="4" stroke-linecap="round" />
        <path d="M 45 60 Q 60 45, 65 30" fill="none" stroke="#5D4037" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="35" cy="65" r="8" fill="#F48FB1" />
        <circle cx="35" cy="65" r="4" fill="#D81B60" />
        <circle cx="65" cy="30" r="10" fill="#F48FB1" />
        <circle cx="65" cy="30" r="5" fill="#D81B60" />
        <circle cx="80" cy="32" r="7" fill="#F8BBD0" />
      </svg>`;
      break;
    case 'body-star':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <polygon points="50,10 63,35 90,38 70,57 75,85 50,72 25,85 30,57 10,38 37,35" fill="#FFD54F" stroke="#FF8F00" stroke-width="3"/>
      </svg>`;
      break;
    case 'rim-gold':
      return '/gold_pattern_no_bg.png';
    case 'rim-dots':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <circle cx="15" cy="10" r="5" fill="#FFF"/><circle cx="35" cy="10" r="5" fill="#FFF"/><circle cx="55" cy="10" r="5" fill="#FFF"/><circle cx="75" cy="10" r="5" fill="#FFF"/><circle cx="95" cy="10" r="5" fill="#FFF"/>
      </svg>`;
      break;
    case 'rim-wave':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <path d="M 0 10 Q 12 2, 25 10 T 50 10 T 75 10 T 100 10" fill="none" stroke="#CD853F" stroke-width="4"/>
      </svg>`;
      break;
    case 'rim-meander':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <path d="M 0 5 L 20 5 L 20 15 L 40 15 L 40 5 L 60 5 L 60 15 L 80 15 L 80 5 L 100 5" fill="none" stroke="#FFB300" stroke-width="3" />
      </svg>`;
      break;
    case 'rim-bead-gold':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <circle cx="20" cy="10" r="6" fill="#FFD54F" stroke="#E65100" stroke-width="2" />
        <circle cx="50" cy="10" r="6" fill="#FFD54F" stroke="#E65100" stroke-width="2" />
        <circle cx="80" cy="10" r="6" fill="#FFD54F" stroke="#E65100" stroke-width="2" />
      </svg>`;
      break;
    case 'base-cloud':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <path d="M 10 15 C 15 8, 25 8, 30 15 C 35 8, 45 8, 50 15 C 55 8, 65 8, 70 15" fill="none" stroke="#81D4FA" stroke-width="4" stroke-linecap="round"/>
      </svg>`;
      break;
    case 'base-ring':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <line x1="0" y1="5" x2="100" y2="5" stroke="#FFB300" stroke-width="3"/>
        <line x1="0" y1="15" x2="100" y2="15" stroke="#FFB300" stroke-width="3"/>
      </svg>`;
      break;
    case 'base-flame':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <path d="M 0 18 Q 10 2, 20 18 T 40 18 T 60 18 T 80 18 T 100 18" fill="none" stroke="#FF5722" stroke-width="4"/>
      </svg>`;
      break;
    case 'base-water-wave':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 100 20">
        <path d="M 0 15 C 15 5, 25 18, 40 15 C 55 12, 65 18, 80 15 L 100 15" fill="none" stroke="#0288D1" stroke-width="4" />
      </svg>`;
      break;
    default:
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="35" fill="#FFB300" stroke="#FF6F00" stroke-width="4"/>
      </svg>`;
      break;
  }
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}



function createTextTexture(text: string, color: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = 'bold 44px Outfit, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export interface ThreeModelViewerRef {
  exportToGLTF: () => void;
}

export const ThreeModelViewer = React.forwardRef<ThreeModelViewerRef, ThreeModelViewerProps>(({
  fileData,
  fileType,
  shapeId,
  clayId,
  potWidth,
  potHeight,
  rimScale,
  baseScale,
  potScale = 1.0,
  useCustomClayColor,
  clayColor1,
  clayColor2,
  clayGrainLevel = 30,
  glazeId,
  useCustomGlazeColor,
  customGlazeColor,
  glazeOpacity,
  glazeGlossyLevel,
  glazeMetallicLevel,
  finishType,
  spinSpeed,
  equippedDecals,
  decorations,
  selectedDecalId,
  onSelectDecal,
  onUpdateDecal,
  engravedText,
  engravingColor,
  referenceObject = 'none',
  refObjectX = 0,
  refObjectZ = 0,
  refObjectRotation = 0,
  showAxes = true,
  isDrawingMode = false,
  drawingPaths = [],
  onDrawStroke,
  brushColor = '#D84315',
  brushSize = 4
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Persistent refs to allow updating properties without resetting OrbitControls or renderer
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const decalGroupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const modelObjectRef = useRef<THREE.Object3D | null>(null);
  const refObjectMeshRef = useRef<THREE.Object3D | null>(null);
  const axesGroupRef = useRef<THREE.Group | null>(null);

  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  if (!textureCanvasRef.current) {
    textureCanvasRef.current = document.createElement('canvas');
    textureCanvasRef.current.width = 1024;
    textureCanvasRef.current.height = 1024;
  }
  const lastDrawPointRef = useRef<{x: number, y: number} | null>(null);
  const drawingPathsRef = useRef(drawingPaths);
  drawingPathsRef.current = drawingPaths;

  // Rotation offset states for custom STL/OBJ files
  const [rotX, setRotX] = useState(-90);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);

  // Use a mutable ref for animation loop to check spinSpeed updates instantly without re-creating loop
  const spinSpeedRef = useRef(spinSpeed);
  useEffect(() => {
    spinSpeedRef.current = spinSpeed;
  }, [spinSpeed]);

  // 1. One-time Setup: Scene, Camera, Renderer, Table
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 340;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 25, 90);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const cameraTarget = new THREE.Vector3(0, 10, 0);
    camera.lookAt(cameraTarget);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(cameraTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 180;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 0.85);
    scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.4);
    mainLight.position.set(30, 80, 50);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.001; // fix self-shadow acne on curved surfaces
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.55);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    const spotLight = new THREE.SpotLight(0xffffff, 4, 150, Math.PI / 6, 0.5, 1);
    spotLight.position.set(10, 60, 40);
    scene.add(spotLight);

    // Rotating platform group
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);
    turntableGroupRef.current = turntableGroup;

    // Platform base cylinders
    const tableGeom = new THREE.CylinderGeometry(28, 28, 2, 64);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x5D4F43,
      roughness: 0.6,
      metalness: 0.2,
    });
    const tableMesh = new THREE.Mesh(tableGeom, tableMat);
    tableMesh.position.y = -1;
    tableMesh.receiveShadow = true;
    turntableGroup.add(tableMesh);

    const capGeom = new THREE.CylinderGeometry(3, 3, 0.4, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x9E9E9E, roughness: 0.2, metalness: 0.8 });
    const capMesh = new THREE.Mesh(capGeom, capMat);
    capMesh.position.y = 0.2;
    turntableGroup.add(capMesh);

    // Initialize realistic pottery material
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentSpinSpeed = spinSpeedRef.current;
      if (currentSpinSpeed > 0) {
        const rotationSpeed = (2 * Math.PI) / currentSpinSpeed;
        turntableGroup.rotation.y += delta * rotationSpeed;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tableGeom.dispose();
      tableMat.dispose();
      capGeom.dispose();
      capMat.dispose();
      material.dispose();
      controls.dispose();
    };
  }, []);

  // 2. Load / Update Geometry (Triggers on shape, size, or orientation offsets change)
  useEffect(() => {
    const turntableGroup = turntableGroupRef.current;
    const material = materialRef.current;
    if (!turntableGroup || !material) return;

    // Delete old model mesh
    if (modelObjectRef.current) {
      turntableGroup.remove(modelObjectRef.current);
    }

    let modelObject: THREE.Object3D | null = null;

    // Helper to create toon ink outlines
    const createOutline = (geom: THREE.BufferGeometry) => {
      const outlineMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          void main() {
            vec3 pos = position + normal * 0.15; // uniform thickness
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          void main() {
            gl_FragColor = vec4(0.12, 0.09, 0.07, 1.0); // clean dark outline
          }
        `,
        side: THREE.BackSide
      });
      return new THREE.Mesh(geom, outlineMaterial);
    };

    try {
      if (shapeId === 'custom3d' && fileData && fileType) {
        if (fileType === 'stl') {
          const loader = new STLLoader();
          const buffer = dataURLToArrayBuffer(fileData);
          const geometry = loader.parse(buffer);
          const smoothGeometry = mergeVertices(geometry);
          smoothGeometry.center();
          smoothGeometry.computeVertexNormals();

          modelObject = new THREE.Mesh(smoothGeometry, material);
          modelObject.add(createOutline(smoothGeometry));
        } else if (fileType === 'obj') {
          const loader = new OBJLoader();
          let text = '';
          if (fileData.startsWith('data:')) {
            text = atob(fileData.split(',')[1]);
          } else {
            text = fileData;
          }
          const group = loader.parse(text);
          group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const smoothGeom = mergeVertices(child.geometry);
              smoothGeom.computeVertexNormals();
              child.geometry = smoothGeom;
              child.material = material;
              child.add(createOutline(smoothGeom));
            }
          });
          const box = new THREE.Box3().setFromObject(group);
          const center = new THREE.Vector3();
          box.getCenter(center);
          group.children.forEach((child) => {
            child.position.sub(center);
          });

          modelObject = group;
        }

        if (modelObject) {
          modelObject.castShadow = true;
          modelObject.receiveShadow = true;
          
          // 1. Calculate scale factor from unrotated/unscaled bounding box first
          const box = new THREE.Box3().setFromObject(modelObject);
          const sizeVec = new THREE.Vector3();
          box.getSize(sizeVec);
          const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
          const scaleFactor = 35 / maxDim;
          
          // 2. Apply scale and rotation first
          modelObject.scale.set(scaleFactor, scaleFactor, scaleFactor);
          modelObject.rotation.set(
            THREE.MathUtils.degToRad(rotX),
            THREE.MathUtils.degToRad(rotY),
            THREE.MathUtils.degToRad(rotZ)
          );
          
          // 3. Update world matrix to apply transformations
          modelObject.updateMatrixWorld(true);
          
          // 4. Calculate actual world-space height after scale/rotation (with position still at Y=0)
          modelObject.position.set(0, 0, 0); // ensure centered vertically at 0 first
          modelObject.updateMatrixWorld(true);
          
          const rotatedBox = new THREE.Box3().setFromObject(modelObject);
          const rotatedSize = new THREE.Vector3();
          rotatedBox.getSize(rotatedSize);
          
          // 5. Position it so the bottom face sits exactly on the turntable cap at Y=0.4
          modelObject.position.set(0, rotatedSize.y / 2 + 0.4, 0);
          console.log("DEBUG_POT: scaleFactor =", scaleFactor, "sizeVec =", sizeVec, "rotatedSize =", rotatedSize, "posY =", modelObject.position.y);
        }
      } else {
        // Standard shapes generator with LatheGeometry
        const outerPoints = [];
        const segments = shapeId === 'octagon' ? 8 : 64;
        
        const scaleVal = potScale ?? 1.0;
        const wFactor = (potWidth / 160) * 11 * scaleVal;
        const hFactor = (potHeight / 180) * 26 * scaleVal;

        if (shapeId === 'round' || shapeId === 'octagon') {
          for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const y = t * hFactor;
            const scaleAtPoint = t < 0.4 ? (baseScale + (1.0 - baseScale) * (t / 0.4)) : 1.0;
            const rimScaleAtPoint = t < 0.5 ? 1.0 : (1.0 + (rimScale - 1.0) * ((t - 0.5) / 0.5));
            const r = wFactor * (0.8 + 0.5 * Math.sin(t * Math.PI)) * rimScaleAtPoint * scaleAtPoint;
            outerPoints.push(new THREE.Vector2(r, y));
          }
        } else if (shapeId === 'tall') {
          for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const y = t * hFactor;
            const scaleAtPoint = t < 0.4 ? (baseScale + (1.0 - baseScale) * (t / 0.4)) : 1.0;
            const rimScaleAtPoint = t < 0.5 ? 1.0 : (1.0 + (rimScale - 1.0) * ((t - 0.5) / 0.5));
            // A sleek, tall, elegant plant pot shape (widening slightly towards the top with a subtle middle curve)
            const r = wFactor * (0.6 + 0.25 * t + 0.15 * Math.sin(t * Math.PI)) * rimScaleAtPoint * scaleAtPoint;
            outerPoints.push(new THREE.Vector2(r, y));
          }
        } else if (shapeId === 'classic') {
          const numPoints = 60;
          for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const y = t * hFactor;
            
            let rBase = 0.55 + 0.3 * t; // Basic conical shape
            
            // Lower ridge
            if (Math.abs(t - 0.35) < 0.02) {
               rBase += 0.025 * (1 + Math.cos(Math.PI * (t - 0.35) / 0.02)) / 2;
            }
            
            // Upper ridge
            if (Math.abs(t - 0.72) < 0.02) {
               rBase += 0.025 * (1 + Math.cos(Math.PI * (t - 0.72) / 0.02)) / 2;
            }
            
            // Top thick rim
            if (t >= 0.82) {
               rBase += 0.12; 
               if (t < 0.85) {
                   rBase -= 0.12 * Math.pow((0.85 - t)/0.03, 2);
               }
               if (t > 0.95) {
                   rBase -= 0.08 * Math.pow((t - 0.95)/0.05, 2);
               }
            }

            const scaleAtPoint = t < 0.4 ? (baseScale + (1.0 - baseScale) * (t / 0.4)) : 1.0;
            const rimScaleAtPoint = t < 0.82 ? 1.0 : (1.0 + (rimScale - 1.0) * ((t - 0.82) / 0.18));
            const r = wFactor * rBase * rimScaleAtPoint * scaleAtPoint;
            outerPoints.push(new THREE.Vector2(r, y));
          }
        } else { // wide
          for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const y = t * hFactor;
            const scaleAtPoint = t < 0.4 ? (baseScale + (1.0 - baseScale) * (t / 0.4)) : 1.0;
            const rimScaleAtPoint = t < 0.5 ? 1.0 : (1.0 + (rimScale - 1.0) * ((t - 0.5) / 0.5));
            // A beautiful wide pot shape with a stable base and subtle organic curvature (slightly steeper to prevent looking flat)
            const r = wFactor * (0.75 + 0.35 * t + 0.1 * Math.sin(t * Math.PI)) * rimScaleAtPoint * scaleAtPoint;
            outerPoints.push(new THREE.Vector2(r, y));
          }
        }

        // Build double-walled points to give the pot wall thickness
        const points = [];
        const thickness = wFactor * 0.08; // Wall thickness (approx 8% of width)
        const bottomThickness = hFactor * 0.07; // Bottom base thickness (approx 7% of height)

        // 1. Bottom outer center (flat bottom base)
        points.push(new THREE.Vector2(0, 0));

        // 2. Outer profile (bottom to top)
        for (let i = 0; i < outerPoints.length; i++) {
          points.push(outerPoints[i]);
        }

        // 3. Inner profile (top to bottom)
        for (let i = outerPoints.length - 1; i >= 1; i--) {
          const pt = outerPoints[i];
          // Ensure thickness doesn't exceed 70% of outer radius (so it never intersects)
          const currentThickness = Math.min(thickness, pt.x * 0.7);
          const innerX = Math.max(0.1, pt.x - currentThickness);
          
          // Slant the top rim downward toward the inside for a more natural ceramic chamfered lip
          let slant = 0;
          if (i === outerPoints.length - 1) {
            slant = currentThickness * 0.4;
          } else if (i === outerPoints.length - 2) {
            slant = currentThickness * 0.2;
          }
          
          // Ensure inner wall doesn't penetrate bottom base
          const innerY = Math.max(bottomThickness, pt.y - slant);
          points.push(new THREE.Vector2(innerX, innerY));
        }

        // 4. Bottom inner center (flat inner floor)
        points.push(new THREE.Vector2(0, bottomThickness));

        const latheGeometry = new THREE.LatheGeometry(points, segments);

        // Custom UV mapping for outer pot profile so V goes 0.0 -> 1.0 (bottom base -> top rim)
        const uvAttr = latheGeometry.attributes.uv;
        const totalPoints = points.length; 
        const outerPtsCount = outerPoints.length;
        
        for (let i = 0; i <= segments; i++) {
          for (let j = 0; j < totalPoints; j++) {
            const vertexIndex = i * totalPoints + j;
            if (j >= 1 && j <= outerPtsCount) {
              // Outer surface profile points (j=1 is outer bottom base, j=outerPtsCount is outer top rim)
              const outerV = (j - 1) / (outerPtsCount - 1);
              uvAttr.setY(vertexIndex, outerV);
            } else if (j > outerPtsCount) {
              // Inner wall profile points: map to top margin
              uvAttr.setY(vertexIndex, 1.05);
            } else {
              // j = 0 (outer bottom center)
              uvAttr.setY(vertexIndex, 0.0);
            }
          }
        }
        uvAttr.needsUpdate = true;

        const smoothGeometry = mergeVertices(latheGeometry);
        smoothGeometry.center();
        smoothGeometry.computeVertexNormals();

        modelObject = new THREE.Mesh(smoothGeometry, material);
        modelObject.castShadow = true;
        modelObject.receiveShadow = true;
        modelObject.add(createOutline(smoothGeometry));

        const box = new THREE.Box3().setFromObject(modelObject);
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        modelObject.position.set(0, sizeVec.y / 2 + 0.4, 0);
      }

      if (modelObject) {
        turntableGroup.add(modelObject);
        modelObjectRef.current = modelObject;
      }
    } catch (err) {
      console.error('Failed to update geometry:', err);
    }
  }, [shapeId, potWidth, potHeight, rimScale, baseScale, potScale, fileData, fileType, rotX, rotY, rotZ]);

  // Render Real-Life Reference Object (iPhone, Soda Can, Thai Coin) next to pot on turntable
  useEffect(() => {
    const turntableGroup = turntableGroupRef.current;
    if (!turntableGroup) return;

    if (refObjectMeshRef.current) {
      turntableGroup.remove(refObjectMeshRef.current);
      refObjectMeshRef.current = null;
    }

    if (referenceObject === 'none') return;

    const scaleVal = potScale ?? 1.0;
    const wFactor = (potWidth / 160) * 11 * scaleVal;
    const defaultRefX = -(wFactor + 7);
    const finalX = defaultRefX + refObjectX;
    const finalZ = refObjectZ;

    const refGroup = new THREE.Group();

    if (referenceObject === 'iphone') {
      // iPhone 15 Pro (14.7 cm height, 7.1 cm width, 0.8 cm depth)
      const hUnits = 21.2;
      const wUnits = 10.2;
      const dUnits = 1.2;
      const bodyGeom = new THREE.BoxGeometry(wUnits, hUnits, dUnits);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.2, metalness: 0.8 });
      const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
      bodyMesh.position.set(0, hUnits / 2 + 0.4, 0);

      // Phone screen
      const screenGeom = new THREE.PlaneGeometry(wUnits - 0.6, hUnits - 1.2);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x007aff, side: THREE.DoubleSide });
      const screenMesh = new THREE.Mesh(screenGeom, screenMat);
      screenMesh.position.set(0, hUnits / 2 + 0.4, dUnits / 2 + 0.05);

      refGroup.add(bodyMesh);
      refGroup.add(screenMesh);
    } else if (referenceObject === 'can') {
      // Soda Can 330ml (12.3 cm height, 6.6 cm diameter)
      const hUnits = 17.7;
      const rUnits = 4.75;
      const canGeom = new THREE.CylinderGeometry(rUnits, rUnits, hUnits, 32);
      const canMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.3, metalness: 0.6 });
      const canMesh = new THREE.Mesh(canGeom, canMat);
      canMesh.position.set(0, hUnits / 2 + 0.4, 0);

      // Top silver lip
      const lipGeom = new THREE.CylinderGeometry(rUnits, rUnits, 0.8, 32);
      const lipMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.1, metalness: 0.9 });
      const lipMesh = new THREE.Mesh(lipGeom, lipMat);
      lipMesh.position.set(0, hUnits + 0.4, 0);

      refGroup.add(canMesh);
      refGroup.add(lipMesh);
    } else if (referenceObject === 'coin') {
      // 10-Baht Thai Coin (2.6 cm diameter, 0.25 cm height)
      const rUnits = 1.85 * 2;
      const hUnits = 0.6;
      const coinGeom = new THREE.CylinderGeometry(rUnits, rUnits, hUnits, 32);
      const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 });
      const coinMesh = new THREE.Mesh(coinGeom, coinMat);
      coinMesh.position.set(0, hUnits / 2 + 0.4, 0);

      refGroup.add(coinMesh);
    }

    refGroup.position.set(finalX, 0, finalZ);
    refGroup.rotation.y = THREE.MathUtils.degToRad(refObjectRotation);

    turntableGroup.add(refGroup);
    refObjectMeshRef.current = refGroup;

    return () => {
      if (refObjectMeshRef.current && turntableGroup) {
        turntableGroup.remove(refObjectMeshRef.current);
        refObjectMeshRef.current = null;
      }
    };
  }, [referenceObject, potWidth, potScale, refObjectX, refObjectZ, refObjectRotation]);

  // Render XYZ Axis Lines (Red = X, Green = Y, Blue = Z) + 3D Grid Helper
  useEffect(() => {
    const turntableGroup = turntableGroupRef.current;
    if (!turntableGroup) return;

    if (axesGroupRef.current) {
      turntableGroup.remove(axesGroupRef.current);
      axesGroupRef.current = null;
    }

    if (!showAxes) return;

    const axesGroup = new THREE.Group();

    // 1. Standard Three.js AxesHelper (size 35)
    const axesHelper = new THREE.AxesHelper(35);
    axesHelper.position.set(0, 0.4, 0);
    axesGroup.add(axesHelper);

    // 2. Subtle Grid Helper on turntable base plate
    const gridHelper = new THREE.GridHelper(50, 10, 0x4E9F3D, 0xCCCCCC);
    gridHelper.position.set(0, 0.4, 0);
    axesGroup.add(gridHelper);

    // 3. Text Label Sprites for X, Y, Z axes
    const makeTextSprite = (text: string, color: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = 'bold 32px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 80, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(14, 5.6, 1);
      return sprite;
    };

    const xLabel = makeTextSprite('X (กว้าง)', '#FF3344');
    xLabel.position.set(38, 1.5, 0);

    const yLabel = makeTextSprite('Y (สูง)', '#33CC44');
    yLabel.position.set(0, 40, 0);

    const zLabel = makeTextSprite('Z (ลึก)', '#3388FF');
    zLabel.position.set(0, 1.5, 38);

    axesGroup.add(xLabel);
    axesGroup.add(yLabel);
    axesGroup.add(zLabel);

    turntableGroup.add(axesGroup);
    axesGroupRef.current = axesGroup;

    return () => {
      if (axesGroupRef.current && turntableGroup) {
        turntableGroup.remove(axesGroupRef.current);
        axesGroupRef.current = null;
      }
    };
  }, [showAxes]);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    let isCancelled = false;
    const canvas = textureCanvasRef.current!;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const loadImg = (src: string): Promise<HTMLImageElement> => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });

    const promises: Promise<any>[] = [];
    const decImages: Record<string, HTMLImageElement> = {};
    const eqImages: Record<string, HTMLImageElement> = {};

    if (decorations && decorations.size > 0) {
      decorations.forEach(decId => {
        promises.push(loadImg(getDecalSVGDataURL(decId)).then(img => { decImages[decId] = img; }));
      });
    }

    if (equippedDecals && equippedDecals.length > 0) {
      equippedDecals.forEach(dec => {
        const src = dec.decalId === 'body-dragon' ? '/chinese_dragon_pattern.png' : dec.decalId === 'body-koi-pair' ? '/koi_pattern.png' : (dec.url || getDecalSVGDataURL(dec.decalId));
        promises.push(loadImg(src).then(img => { eqImages[dec.id] = img; }));
      });
    }

    Promise.all(promises).then(() => {
      if (isCancelled) return;

      // 1. Base Clay
      if (useCustomClayColor) {
        const grad = ctx.createLinearGradient(0, 0, 0, 1024);
        grad.addColorStop(0, clayColor1);
        grad.addColorStop(1, clayColor2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);
      } else {
        ctx.fillStyle = getClayColorHex(clayId);
        ctx.fillRect(0, 0, 1024, 1024);
      }

      // 2. Grain
      if (clayGrainLevel > 0) {
        const grainAmount = (clayGrainLevel / 100) * 0.16;
        const imgData = ctx.getImageData(0, 0, 1024, 1024);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() < 0.35) {
            const noise = (Math.random() - 0.5) * 255 * grainAmount;
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // 3. Glaze
      if (useCustomGlazeColor) {
        ctx.fillStyle = customGlazeColor;
        ctx.globalAlpha = glazeOpacity / 100;
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.globalAlpha = 1.0;
      } else if (glazeId !== 'none') {
        ctx.fillStyle = getGlazeColorHex(glazeId);
        ctx.globalAlpha = 0.55;
        ctx.fillRect(0, 0, 1024, 1024);
        ctx.globalAlpha = 1.0;
      }

      // 4. Crackled
      if (finishType === 'crackled') {
        ctx.save();
        ctx.strokeStyle = 'rgba(25, 40, 70, 0.35)';
        ctx.lineWidth = 1.5;
        const step = 56;
        for (let x = 0; x <= 1024; x += step) {
          for (let y = 0; y <= 1024; y += step) {
            const offsetX = Math.sin(x * 0.03 + y * 0.05) * 14;
            const offsetY = Math.cos(x * 0.05 + y * 0.03) * 14;
            ctx.beginPath();
            ctx.moveTo(x + offsetX, y + offsetY);
            ctx.lineTo(x + step + offsetY, y + step + offsetX);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + step - offsetX, y + offsetY);
            ctx.lineTo(x - offsetY, y + step + offsetX);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. Decorations
      if (decorations) {
        decorations.forEach(decId => {
          const img = decImages[decId];
          if (img && img.naturalHeight) {
            const y = decId.startsWith('rim-') ? 40 : (decId.startsWith('base-') ? 880 : null);
            if (y !== null) {
              ctx.save();
              
              // Debug red box
              ctx.fillStyle = 'red';
              ctx.fillRect(0, y, 1024, 100);

              const pat = ctx.createPattern(img, 'repeat-x');
              if (pat) {
                ctx.fillStyle = pat;
                ctx.translate(0, y);
                const scale = 100 / img.naturalHeight;
                ctx.scale(scale, scale);
                ctx.fillRect(0, 0, 1024 / scale, img.naturalHeight);
              }
              ctx.restore();
            }
          }
        });
      }

      // 6. Decals
      if (equippedDecals) {
        equippedDecals.forEach(dec => {
          const img = eqImages[dec.id];
          if (!img || !img.naturalWidth) return;
          const cx = 512 + (dec.x / 100) * 512;
          const cy = 512 - (dec.y / 100) * 440;
          const decSize = 340 * dec.scale;
          const t_val = Math.max(0, Math.min(1, (1024 - cy) / 1024));
          let rBase = 1.0;
          if (shapeId === 'classic') {
             rBase = 0.55 + 0.3 * t_val;
          } else if (shapeId === 'tall') {
             rBase = 0.6 + 0.25 * t_val + 0.15 * Math.sin(t_val * Math.PI);
          } else if (shapeId === 'wide') {
             rBase = 0.75 + 0.35 * t_val + 0.1 * Math.sin(t_val * Math.PI);
          } else {
             rBase = 0.8 + 0.5 * Math.sin(t_val * Math.PI);
          }
          const localWFactor = (potWidth / 160) * 11;
          const localHFactor = (potHeight / 180) * 26;
          const physicalCircumference = 2 * Math.PI * rBase * localWFactor;
          const physicalAspect = physicalCircumference / localHFactor;
          
          const aspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : 1.0;
          const drawH = decSize;
          const drawW = decSize * aspect;
          const squish = 1 / physicalAspect;

          if (dec.isWrap) {
            ctx.save();
            const dx = (dec.x / 100) * 512;
            ctx.translate(512 + dx, cy);
            ctx.scale(squish, 1);
            ctx.rotate(THREE.MathUtils.degToRad(-dec.rotation));
            const localCanvasWidth = 1024 / squish;
            const minTiles = Math.max(1, Math.round(localCanvasWidth / drawW));
            const tileW = localCanvasWidth / minTiles;
            const actualDrawH = tileW / aspect; // preserve aspect ratio!
            for (let tx = -localCanvasWidth * 1.5 - tileW; tx <= localCanvasWidth * 1.5 + tileW; tx += tileW) {
              ctx.drawImage(img, tx, -actualDrawH / 2, tileW, actualDrawH);
            }
            ctx.restore();
          } else {
            const offsets = [0, -1024, 1024];
            offsets.forEach(offsetX => {
              ctx.save();
              ctx.translate(cx + offsetX, cy);
              ctx.scale(squish, 1);
              ctx.rotate(THREE.MathUtils.degToRad(-dec.rotation));
              ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
              ctx.restore();
            });
          }
        });
      }

      // 7. Paths
      if (drawingPathsRef.current.length > 0) {
        drawingPathsRef.current.forEach(stroke => {
          if (stroke.points.length === 0) return;
          ctx.beginPath();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          if (stroke.points.length === 1) {
            ctx.lineTo(stroke.points[0].x, stroke.points[0].y);
          } else {
            for (let i = 1; i < stroke.points.length; i++) {
              const prev = stroke.points[i - 1];
              const curr = stroke.points[i];
              // Handle UV seam to prevent lines crossing the entire canvas
              if (Math.abs(curr.x - prev.x) > 512) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(curr.x, curr.y);
              } else {
                ctx.lineTo(curr.x, curr.y);
              }
            }
          }
          ctx.stroke();
        });
      }

      // 8. Update Texture
      if (!material.map || material.map.image !== canvas) {
        const potTexture = new THREE.CanvasTexture(canvas);
        potTexture.colorSpace = THREE.SRGBColorSpace;
        potTexture.wrapS = THREE.RepeatWrapping;
        potTexture.wrapT = THREE.ClampToEdgeWrapping;
        material.map = potTexture;
      }
      material.color.set('#FFFFFF');
      material.map.needsUpdate = true;
      material.needsUpdate = true;
    });

    let roughnessVal = finishType === 'matte' ? 0.88 : finishType === 'crackled' ? 0.35 : 0.12;
    if (finishType === 'matte' && clayGrainLevel > 0) {
      roughnessVal = Math.min(1.0, roughnessVal + (clayGrainLevel / 100) * 0.1);
    }
    if (finishType === 'glossy' && glazeGlossyLevel !== undefined) {
      roughnessVal = Math.max(0.02, 0.25 - (glazeGlossyLevel / 100) * 0.22);
    }

    const metalnessVal = useCustomGlazeColor ? (glazeMetallicLevel / 100) : (glazeId === 'gold' ? 0.85 : 0.08);

    material.roughness = roughnessVal;
    material.metalness = metalnessVal;
    material.needsUpdate = true;
    
    return () => {
      isCancelled = true;
    };
  }, [clayId, useCustomClayColor, clayColor1, clayColor2, clayGrainLevel, glazeId, useCustomGlazeColor, customGlazeColor, glazeOpacity, glazeGlossyLevel, glazeMetallicLevel, finishType, equippedDecals, decorations, potWidth, potHeight]);

  // 4. Update Text Overlay & Engraving
  useEffect(() => {
    const modelObject = modelObjectRef.current;
    if (!modelObject) return;

    if (decalGroupRef.current) {
      modelObject.remove(decalGroupRef.current);
    }

    const decalGroup = new THREE.Group();
    decalGroupRef.current = decalGroup;
    modelObject.add(decalGroup);

    const box = new THREE.Box3().setFromObject(modelObject);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    const radius = sizeVec.x / 2;

    let targetMesh: THREE.Mesh | null = null;
    if (modelObject instanceof THREE.Mesh) {
      targetMesh = modelObject;
    } else {
      modelObject.traverse((child) => {
        if (child instanceof THREE.Mesh && !targetMesh) {
          targetMesh = child;
        }
      });
    }

    if (engravedText && targetMesh) {
      const textTexture = createTextTexture(engravedText, engravingColor);
      const textMat = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -12,
        polygonOffsetUnits: -12,
        depthWrite: false
      });

      const targetY = -sizeVec.y * 0.35;
      const rayStart = new THREE.Vector3(0, targetY, radius * 3);
      const rayDir = new THREE.Vector3(0, 0, -1);
      const raycaster = new THREE.Raycaster(rayStart, rayDir);
      const intersects = raycaster.intersectObject(targetMesh, false);

      let hitPoint = new THREE.Vector3(0, targetY, radius);
      let hitNormal = new THREE.Vector3(0, 0, 1);
      if (intersects.length > 0) {
        hitPoint = intersects[0].point.clone();
        if (intersects[0].face) hitNormal = intersects[0].face.normal.clone();
      }

      const dummy = new THREE.Object3D();
      dummy.position.copy(hitPoint);
      dummy.lookAt(hitPoint.clone().sub(hitNormal));

      const textSize = new THREE.Vector3(radius * 1.5, radius * 0.45, radius * 1.2);
      try {
        const textGeom = new DecalGeometry(targetMesh, hitPoint, dummy.rotation, textSize);
        const textMesh = new THREE.Mesh(textGeom, textMat);
        decalGroup.add(textMesh);
      } catch (err) {
        const textGeom = new THREE.PlaneGeometry(radius * 1.5, radius * 0.4);
        const textMesh = new THREE.Mesh(textGeom, textMat);
        textMesh.position.set(0, targetY, radius + 0.25);
        decalGroup.add(textMesh);
      }
    }
  }, [engravedText, engravingColor, shapeId, fileData, potWidth, potHeight, rimScale, baseScale]);

  const isDraggingRef = useRef(false);
  const stateRef = useRef({ selectedDecalId, equippedDecals, isDrawingMode, onSelectDecal, onUpdateDecal, onDrawStroke, brushColor, brushSize });
  stateRef.current = { selectedDecalId, equippedDecals, isDrawingMode, onSelectDecal, onUpdateDecal, onDrawStroke, brushColor, brushSize };

  // 5. Setup dynamic Raycast clicking, direct pointer dragging, and wheel scaling on decals
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!renderer || !camera) return;

    const onPointerDown = (event: PointerEvent) => {
      const { isDrawingMode, onDrawStroke, selectedDecalId, equippedDecals, onSelectDecal, onUpdateDecal, brushColor, brushSize } = stateRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const modelObject = modelObjectRef.current;
      if (!modelObject) return;

      if (isDrawingMode && onDrawStroke) {
        const intersects = raycaster.intersectObject(modelObject, true);
        const hit = intersects.find(i => i.uv);
        if (hit) {
          event.stopPropagation();
          isDraggingRef.current = true;
          const uv = hit.uv!;
          const canvasX = uv.x * 1024;
          const canvasY = (1 - uv.y) * 1024;
          
          lastDrawPointRef.current = { x: canvasX, y: canvasY };
          const ctx = textureCanvasRef.current?.getContext('2d');
          if (ctx && materialRef.current?.map) {
             ctx.beginPath();
             ctx.lineCap = 'round';
             ctx.fillStyle = brushColor;
             ctx.arc(canvasX, canvasY, brushSize / 2, 0, Math.PI * 2);
             ctx.fill();
             materialRef.current.map.needsUpdate = true;
          }
          
          onDrawStroke(canvasX, canvasY, true);
          if (controls) controls.enabled = false;
        }
        return;
      }

      // Raycast against decal 3D meshes (text engravings or decal meshes) to select
      const decalGroup = decalGroupRef.current;
      if (decalGroup && decalGroup.children.length > 0) {
        const decalIntersects = raycaster.intersectObjects(decalGroup.children);
        if (decalIntersects.length > 0) {
          onSelectDecal(decalIntersects[0].object.name);
        }
      }

      if (!selectedDecalId || !onUpdateDecal) return;
      const dec = equippedDecals.find(d => d.id === selectedDecalId);
      if (!dec) return;

      const intersects = raycaster.intersectObject(modelObject, true);
      if (intersects.length > 0) {
        event.stopPropagation();
        isDraggingRef.current = true;
        if (controls) controls.enabled = false;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const { isDrawingMode, onDrawStroke, selectedDecalId, onUpdateDecal, brushColor, brushSize } = stateRef.current;

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const modelObject = modelObjectRef.current;
      if (!modelObject) return;

      if (isDrawingMode && onDrawStroke) {
        const intersects = raycaster.intersectObject(modelObject, true);
        const hit = intersects.find(i => i.uv);
        if (hit) {
          const uv = hit.uv!;
          const canvasX = uv.x * 1024;
          const canvasY = (1 - uv.y) * 1024;
          
          if (lastDrawPointRef.current && textureCanvasRef.current && materialRef.current?.map) {
             const ctx = textureCanvasRef.current.getContext('2d');
             if (ctx) {
                // Seam handling logic
                if (Math.abs(canvasX - lastDrawPointRef.current.x) > 512) {
                   onDrawStroke(canvasX, canvasY, true); // End previous and start new stroke
                   lastDrawPointRef.current = { x: canvasX, y: canvasY };
                   return; // Skip drawing this segment to avoid the cross-canvas line
                }

                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = brushColor;
                ctx.lineWidth = brushSize;
                ctx.moveTo(lastDrawPointRef.current.x, lastDrawPointRef.current.y);
                ctx.lineTo(canvasX, canvasY);
                ctx.stroke();
                materialRef.current.map.needsUpdate = true;
             }
          }
          lastDrawPointRef.current = { x: canvasX, y: canvasY };

          onDrawStroke(canvasX, canvasY, false);
        }
        return;
      }

      if (!selectedDecalId || !onUpdateDecal) return;

      const intersects = raycaster.intersectObject(modelObject, true);
      const decHit = intersects.find(i => i.uv);
      if (decHit) {
        const uv = decHit.uv!;
        
        // Map 3D UV intersection directly to 2D Texture Canvas coordinates (1024x1024)
        const canvasX = uv.x * 1024;
        const canvasY = (1 - uv.y) * 1024; // WebGL V=0 is bottom, Canvas Y=0 is top
        
        // Convert canvas X/Y to decal percentage offset properties
        // cx = 512 + (dec.x / 100) * 512 => dec.x = (cx - 512) / 5.12
        // cy = 512 - (dec.y / 100) * 440 => dec.y = (512 - cy) / 4.4
        let newX = Math.round((canvasX - 512) / 5.12);
        let newY = Math.round((512 - canvasY) / 4.4);

        newY = Math.max(-100, Math.min(100, newY));

        onUpdateDecal(selectedDecalId, { x: newX, y: newY });
      }
    };

    const onPointerUp = () => {
      lastDrawPointRef.current = null;
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        if (controls) controls.enabled = true;
      }
    };

    const el = renderer.domElement;
    el.addEventListener('pointerdown', onPointerDown, { capture: true });
    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown, { capture: true });
      window.removeEventListener('pointermove', onPointerMove, { capture: true });
      window.removeEventListener('pointerup', onPointerUp, { capture: true });
      if (controls) controls.enabled = true;
    };
  }, []); // Empty dependency array so listeners are not constantly re-bound

  // Highlight selected decal outline in 3D (visual feedback)
  useEffect(() => {
    const decalGroup = decalGroupRef.current;
    if (!decalGroup) return;
    
    decalGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as any;
        if (mat && mat.emissive) {
          if (child.name === selectedDecalId) {
            mat.emissive.setHex(0x4e9f3d);
            mat.emissiveIntensity = 0.25;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
          }
        }
      }
    });
  }, [selectedDecalId, equippedDecals]);

  const handleExportGLTF = () => {
    const exporter = new GLTFExporter();
    const exportGroup = new THREE.Group();
    if (modelObjectRef.current) exportGroup.add(modelObjectRef.current.clone());
    if (decalGroupRef.current) exportGroup.add(decalGroupRef.current.clone());

    exporter.parse(
      exportGroup,
      (gltf) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = 'custom_pottery.glb';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('An error happened during GLTF export:', error);
      },
      { binary: true } // binary mode for .glb file format which natively bundles textures
    );
  };

  React.useImperativeHandle(ref, () => ({
    exportToGLTF: handleExportGLTF
  }));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Container element */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />
      
      {shapeId === 'custom3d' && fileData && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(4px)',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          zIndex: 20
        }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#8E5431', marginBottom: '2px', textAlign: 'center' }}>
            🔄 หมุนแกนพรีวิว (Flip axis)
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => setRotX(prev => (prev + 90) % 360)}
              style={{
                padding: '4px 6px', fontSize: '9px', fontWeight: 700, borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.15)', background: 'white', cursor: 'pointer'
              }}
            >
              X: {rotX}°
            </button>
            <button 
              type="button"
              onClick={() => setRotY(prev => (prev + 90) % 360)}
              style={{
                padding: '4px 6px', fontSize: '9px', fontWeight: 700, borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.15)', background: 'white', cursor: 'pointer'
              }}
            >
              Y: {rotY}°
            </button>
            <button 
              type="button"
              onClick={() => setRotZ(prev => (prev + 90) % 360)}
              style={{
                padding: '4px 6px', fontSize: '9px', fontWeight: 700, borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.15)', background: 'white', cursor: 'pointer'
              }}
            >
              Z: {rotZ}°
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setRotX(-90); setRotY(0); setRotZ(0); }}
            style={{
              padding: '3px 0', fontSize: '8px', fontWeight: 700, borderRadius: '4px',
              border: 'none', background: '#FF4757', color: 'white', cursor: 'pointer'
            }}
          >
            รีเซ็ตแกนตั้งต้น
          </button>
        </div>
      )}

      {/* Navigation help Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '9.5px',
        color: '#8E5431',
        fontWeight: 700,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(2px)',
        padding: '3px 12px',
        borderRadius: '12px',
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        whiteSpace: 'nowrap'
      }}>
        🖱️ ลากเพื่อหมุนกล้องมองรอบทิศทาง / หมุนลูกกลิ้งเพื่อย่อขยาย
      </div>
    </div>
  );
});
