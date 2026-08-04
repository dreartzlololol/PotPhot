import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { EquippedDecal } from './PotMiniGame';

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
  glazeId: string;
  useCustomGlazeColor: boolean;
  customGlazeColor: string;
  glazeOpacity: number;
  glazeGlossyLevel: number;
  glazeMetallicLevel: number;
  finishType: 'matte' | 'glossy' | 'crackled';
  spinSpeed: number;
  equippedDecals: EquippedDecal[];
  selectedDecalId: string | null;
  onSelectDecal: (id: string | null) => void;
  engravedText: string;
  engravingColor: string;
  referenceObject?: 'none' | 'iphone' | 'can' | 'coin';
  showAxes?: boolean;
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

function getDecalSVGDataURL(decalId: string): string {
  let svgString = '';
  switch (decalId) {
    case 'body-dragon':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 25 65 C 20 50, 30 35, 45 35 C 55 35, 60 45, 65 42 C 72 38, 70 25, 82 28 C 88 30, 85 45, 75 48 C 65 52, 55 68, 42 68 C 30 68, 28 58, 25 65 Z" fill="#FFE082" /><path d="M 45,35 Q 38,40 38,48 T 50,55 T 62,48" fill="none" stroke="#FFF59D" stroke-width="3" /></svg>`;
      break;
    case 'body-lotus':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 15 55 C 10 70, 90 70, 85 55 Z" fill="#2E7D32" /><path d="M 50 20 C 40 40, 25 58, 50 68 C 75 58, 60 40, 50 20 Z" fill="#E91E63" /><circle cx="50" cy="58" r="5" fill="#FBC02D" /></svg>`;
      break;
    case 'body-phoenix':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 12 45 Q 32 15, 55 25 Q 40 38, 12 45 Z" fill="#FF8F00" /><path d="M 12 55 Q 28 68, 50 58 Q 38 48, 12 55 Z" fill="#FF8F00" /></svg>`;
      break;
    case 'body-bamboo':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="45" y="15" width="8" height="70" fill="#2E7D32" /><path d="M 42 35 C 52 30, 58 20, 53 15 Z" fill="#4CAF50" /></svg>`;
      break;
    case 'body-star':
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M 50 10 C 52 35, 65 48, 90 50 C 65 52, 52 65, 50 90 C 48 65, 35 52, 10 50 C 35 48, 48 35, 50 10 Z" fill="#FFD54F" /></svg>`;
      break;
    default:
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#FFD54F" /></svg>`;
  }
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
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

export const ThreeModelViewer: React.FC<ThreeModelViewerProps> = ({
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
  glazeId,
  useCustomGlazeColor,
  customGlazeColor,
  glazeOpacity,
  glazeGlossyLevel,
  glazeMetallicLevel,
  finishType,
  spinSpeed,
  equippedDecals,
  selectedDecalId,
  onSelectDecal,
  engravedText,
  engravingColor,
  referenceObject = 'none',
  showAxes = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Persistent refs to allow updating properties without resetting OrbitControls or renderer
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);
  const decalGroupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshToonMaterial | null>(null);
  const modelObjectRef = useRef<THREE.Object3D | null>(null);
  const refObjectMeshRef = useRef<THREE.Object3D | null>(null);
  const axesGroupRef = useRef<THREE.Group | null>(null);

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

    // Create toon gradient map for cell shading
    const colors = new Uint8Array([0, 100, 180, 255]);
    const toonGradient = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    toonGradient.minFilter = THREE.NearestFilter;
    toonGradient.magFilter = THREE.NearestFilter;
    toonGradient.generateMipmaps = false;
    toonGradient.needsUpdate = true;

    // Initialize toon pottery material
    const material = new THREE.MeshToonMaterial({
      color: 0xcd853f,
      gradientMap: toonGradient,
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
    const refX = -(wFactor + 7);

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

    refGroup.position.set(refX, 0, 0);
    turntableGroup.add(refGroup);
    refObjectMeshRef.current = refGroup;

    return () => {
      if (refObjectMeshRef.current && turntableGroup) {
        turntableGroup.remove(refObjectMeshRef.current);
        refObjectMeshRef.current = null;
      }
    };
  }, [referenceObject, potWidth, potScale]);

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

  // 3. Update Material attributes (color, roughness, metalness, clearcoat)
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    const clayColor = useCustomClayColor ? clayColor2 : getClayColorHex(clayId);
    const finalMaterialColor = new THREE.Color(clayColor);

    if (useCustomGlazeColor) {
      const gCol = new THREE.Color(customGlazeColor);
      finalMaterialColor.lerp(gCol, glazeOpacity / 100);
    } else if (glazeId !== 'none') {
      const gCol = new THREE.Color(getGlazeColorHex(glazeId));
      finalMaterialColor.lerp(gCol, 0.6);
    }

    const roughnessVal = finishType === 'matte' 
      ? 0.9 
      : finishType === 'crackled' ? 0.35 : 0.15;
      
    const metalnessVal = useCustomGlazeColor 
      ? glazeMetallicLevel / 100 
      : (glazeId === 'gold' ? 0.85 : 0.08);

    const clearcoatVal = finishType === 'glossy' 
      ? (useCustomGlazeColor ? glazeGlossyLevel / 100 : 0.92) 
      : 0.0;

    material.color.copy(finalMaterialColor);
    // MeshToonMaterial doesn't support PBR attributes, so we set them dynamically to avoid TS/Runtime errors
    if ('roughness' in material) {
      (material as any).roughness = roughnessVal;
    }
    if ('metalness' in material) {
      (material as any).metalness = metalnessVal;
    }
    if ('clearcoat' in material) {
      (material as any).clearcoat = clearcoatVal;
    }
    material.needsUpdate = true;
  }, [clayId, useCustomClayColor, clayColor1, clayColor2, glazeId, useCustomGlazeColor, customGlazeColor, glazeOpacity, glazeGlossyLevel, glazeMetallicLevel, finishType]);

  // 4. Update Decals & Text Overlay meshes
  useEffect(() => {
    const modelObject = modelObjectRef.current;
    if (!modelObject) return;

    // Clear old decals group
    if (decalGroupRef.current) {
      modelObject.remove(decalGroupRef.current);
    }

    const decalGroup = new THREE.Group();
    decalGroupRef.current = decalGroup;
    modelObject.add(decalGroup);

    const isDefault = !(shapeId === 'custom3d' && fileData);
    if (!isDefault) return;

    const roughnessVal = finishType === 'matte' ? 0.9 : 0.35;
    const metalnessVal = glazeId === 'gold' ? 0.85 : 0.08;

    const box = new THREE.Box3().setFromObject(modelObject);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    const radius = sizeVec.x / 2;

    equippedDecals.forEach((dec) => {
      const size = (radius * 0.7) * dec.scale;
      const decalGeom = new THREE.PlaneGeometry(size, size);
      
      const textureUrl = dec.url || getDecalSVGDataURL(dec.decalId);
      const texture = new THREE.TextureLoader().load(textureUrl);
      
      const decalMat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: roughnessVal,
        metalness: metalnessVal,
        depthWrite: false,
      });

      const decalMesh = new THREE.Mesh(decalGeom, decalMat);
      
      const px = (dec.x / 80) * (radius * 0.8);
      const py = (dec.y / 100) * (sizeVec.y * 0.45);
      const pz = radius + 0.2; 
      
      decalMesh.position.set(px, py, pz);
      decalMesh.rotation.z = -THREE.MathUtils.degToRad(dec.rotation);
      
      decalMesh.name = dec.id;
      decalGroup.add(decalMesh);
    });

    if (engravedText) {
      const textGeom = new THREE.PlaneGeometry(radius * 1.5, radius * 0.4);
      const textTexture = createTextTexture(engravedText, engravingColor);
      const textMat = new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        depthWrite: false
      });
      const textMesh = new THREE.Mesh(textGeom, textMat);
      textMesh.position.set(0, -sizeVec.y * 0.35, radius + 0.25);
      decalGroup.add(textMesh);
    }
  }, [equippedDecals, engravedText, engravingColor, shapeId, fileData, potWidth, potHeight, rimScale, baseScale, finishType, glazeId]);

  // 5. Setup dynamic Raycast clicking/selection on decals
  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onCanvasClick = (event: MouseEvent) => {
      const decalGroup = decalGroupRef.current;
      if (!decalGroup) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(decalGroup.children);

      if (intersects.length > 0) {
        onSelectDecal(intersects[0].object.name);
      }
    };

    renderer.domElement.addEventListener('click', onCanvasClick);
    return () => {
      renderer.domElement.removeEventListener('click', onCanvasClick);
    };
  }, [equippedDecals, onSelectDecal]);

  // Highlight selected decal outline in 3D (visual feedback)
  useEffect(() => {
    const decalGroup = decalGroupRef.current;
    if (!decalGroup) return;
    
    decalGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (child.name === selectedDecalId) {
          mat.emissive.setHex(0x4e9f3d);
          mat.emissiveIntensity = 0.25;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
        }
      }
    });
  }, [selectedDecalId, equippedDecals]);

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
};
