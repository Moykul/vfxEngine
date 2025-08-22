/**
 * Stores all shapes for vfx including GLB model support.
 * 
 * @author Moykul O'Conghaile
 * @version 2.0
 * @class shapeGenerators
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Global cache for loaded GLB models
const glbCache = new Map();
let gltfLoader = null;

/**
 * Initialize the GLTF loader (lazy initialization)
 */
const getGLTFLoader = () => {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();
  }
  return gltfLoader;
};

/**
 * Load and cache a GLB model
 */
export const loadGLBModel = async (url) => {
  // Check cache first
  if (glbCache.has(url)) {
    return glbCache.get(url);
  }

  return new Promise((resolve, reject) => {
    const loader = getGLTFLoader();
    
    loader.load(
      url,
      (gltf) => {
        // Extract all mesh geometries from the GLB
        const meshes = [];
        
        gltf.scene.traverse((child) => {
          if (child.isMesh && child.geometry) {
            meshes.push(child.geometry);
          }
        });
        
        if (meshes.length === 0) {
          reject(new Error('No mesh geometries found in GLB file'));
          return;
        }
        
        // Use the first mesh (or merge all meshes if needed)
        const geometry = meshes[0];
        
        // Cache the result
        glbCache.set(url, geometry);
        resolve(geometry);
      },
      (progress) => {
        console.log('GLB loading progress:', progress);
      },
      (error) => {
        console.error('Error loading GLB:', error);
        reject(error);
      }
    );
  });
};

/**
 * Generate particle positions from GLB model vertices
 */
export const generateGLB = async (count, glbPath, radius = 1, heightMultiplier = 1, options = {}) => {
  const {
    distributeEvenly = false,
    surfaceOnly = false,
    randomOffset = 0.1
  } = options;

  try {
    const geometry = await loadGLBModel(glbPath);
    
    if (!geometry.attributes.position) {
      throw new Error('GLB model has no position attributes');
    }
    
    // Prefer sampling on triangle surfaces (area-weighted) for good coverage
    const posAttr = geometry.attributes.position;
    const posArray = posAttr.array;
    const vertexCount = posAttr.count;

    // Build index array for triangles
    let indexArray = null;
    if (geometry.index && geometry.index.array) {
      indexArray = geometry.index.array;
    } else {
      // If non-indexed but positions form a triangle list (common when exported non-indexed)
      // assume sequential triangles when vertexCount is divisible by 3
      if (vertexCount % 3 === 0) {
        indexArray = new Uint32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) indexArray[i] = i;
      }
    }

    // If we can't build triangle indices, fall back to vertex sampling
    if (!indexArray) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const vi = Math.floor(Math.random() * vertexCount) * 3;
        let x = posArray[vi] * radius;
        let y = posArray[vi + 1] * radius * heightMultiplier;
        let z = posArray[vi + 2] * radius;
        if (randomOffset > 0) {
          x += (Math.random() - 0.5) * randomOffset;
          y += (Math.random() - 0.5) * randomOffset;
          z += (Math.random() - 0.5) * randomOffset;
        }
        positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
      }
      return positions;
    }

    // Build triangle list and area CDF (cache on geometry.userData._triSampler to reuse)
    let triCount, triAreas, totalArea, cdf;
    // always-have vector helpers to avoid undefined .set() when using cached sampler
    let vA = new THREE.Vector3();
    let vB = new THREE.Vector3();
    let vC = new THREE.Vector3();
    let edge1 = new THREE.Vector3();
    let edge2 = new THREE.Vector3();

    if (geometry.userData && geometry.userData._triSampler) {
      const sampler = geometry.userData._triSampler;
      triCount = sampler.triCount;
      triAreas = sampler.triAreas;
      totalArea = sampler.totalArea;
      cdf = sampler.cdf;
      // Restore indexArray from cache so triangle indices are available
      indexArray = sampler.indexArray;
    } else {
      triCount = indexArray.length / 3;
      triAreas = new Float32Array(triCount);
      totalArea = 0;

      vA = new THREE.Vector3();
      vB = new THREE.Vector3();
      vC = new THREE.Vector3();
      edge1 = new THREE.Vector3();
      edge2 = new THREE.Vector3();

      for (let t = 0; t < triCount; t++) {
        const i0 = indexArray[t * 3] * 3;
        const i1 = indexArray[t * 3 + 1] * 3;
        const i2 = indexArray[t * 3 + 2] * 3;

        vA.set(posArray[i0], posArray[i0 + 1], posArray[i0 + 2]);
        vB.set(posArray[i1], posArray[i1 + 1], posArray[i1 + 2]);
        vC.set(posArray[i2], posArray[i2 + 1], posArray[i2 + 2]);

        edge1.subVectors(vB, vA);
        edge2.subVectors(vC, vA);
        const area = edge1.cross(edge2).length() * 0.5;
        triAreas[t] = area;
        totalArea += area;
      }

      // Build cumulative distribution
      cdf = new Float32Array(triCount);
      let c = 0;
      for (let t = 0; t < triCount; t++) {
        c += triAreas[t];
        cdf[t] = c;
      }

      // store sampler data for reuse
      geometry.userData = geometry.userData || {};
      geometry.userData._triSampler = {
        triCount,
        triAreas,
        totalArea,
        cdf,
        indexArray
      };
    }

    const positions = new Float32Array(count * 3);

    // Helper to pick triangle by area-weighted random
    const pickTriangle = (r) => {
      // Binary search over cdf
      let lo = 0, hi = triCount - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (r <= cdf[mid]) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    };

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Choose triangle
      let triIndex;
      if (distributeEvenly) {
        // Spread samples evenly across the area using deterministic offsets
        const areaPerSample = totalArea / count;
        const sampleTarget = (i + 0.5) * areaPerSample;
        triIndex = pickTriangle(sampleTarget);
      } else {
        const r = Math.random() * totalArea;
        triIndex = pickTriangle(r);
      }

      const idx0 = indexArray[triIndex * 3] * 3;
      const idx1 = indexArray[triIndex * 3 + 1] * 3;
      const idx2 = indexArray[triIndex * 3 + 2] * 3;

      vA.set(posArray[idx0], posArray[idx0 + 1], posArray[idx0 + 2]);
      vB.set(posArray[idx1], posArray[idx1 + 1], posArray[idx1 + 2]);
      vC.set(posArray[idx2], posArray[idx2 + 1], posArray[idx2 + 2]);

      // Sample barycentric coordinates uniformly
      let r1 = Math.random();
      let r2 = Math.random();
      // Ensure uniform sampling on triangle
      const sqrtR1 = Math.sqrt(r1);
      const a = 1 - sqrtR1;
      const b = sqrtR1 * (1 - r2);
      const cB = sqrtR1 * r2;

      const sampled = new THREE.Vector3();
      sampled.copy(vA).multiplyScalar(a).addScaledVector(vB, b).addScaledVector(vC, cB);

      let x = sampled.x * radius;
      let y = sampled.y * radius * heightMultiplier;
      let z = sampled.z * radius;

      if (randomOffset > 0) {
        x += (Math.random() - 0.5) * randomOffset;
        y += (Math.random() - 0.5) * randomOffset;
        z += (Math.random() - 0.5) * randomOffset;
      }

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
    }

    return positions;
    
  } catch (error) {
    console.error('Failed to generate GLB positions:', error);
    // Fallback to explosion pattern
    return generateExplosion(count, radius);
  }
};

/**
 * Generate mesh geometry for FlowField-like effects using GLB
 * This creates a simple mesh representation that can be used for particle effects
 */
export const generateFlowFieldMesh = (count, spread, glbPath = null) => {
  if (glbPath) {
    // If GLB path provided, create a placeholder that will be replaced
    // when the actual GLB loads (this is for immediate rendering)
    return new THREE.PlaneGeometry(spread, spread, 32, 32);
  }
  
  // Default flow field mesh - a subdivided plane with some noise
  const geometry = new THREE.PlaneGeometry(spread, spread, 32, 32);
  const positions = geometry.attributes.position.array;
  
  // Add some variation to create flow field-like patterns
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += (Math.random() - 0.5) * 0.2; // x variation
    positions[i + 1] += (Math.random() - 0.5) * 0.2; // y variation
    positions[i + 2] += (Math.random() - 0.5) * 0.1; // z variation
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  
  return geometry;
};

/**
 * Generate particle positions for tornado pattern
 */
export const generateTornado = (
  count, 
  tornadoHeight = 8.0, 
  spiralBranches = 3, 
  spiralSpin = 2.0, 
  spiralRadius = 2.0, 
  baseDiameter = 0.5, 
  topDiameter = 3.0, 
  spiralRandomness = 0.2, 
  spiralRandomnessPower = 3, 
  layerCount = 1, 
  layerOffset = 0.5, 
  vortexStrength = 1.0
) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Determine which layer this particle belongs to
    const layer = Math.floor(i / (count / layerCount));
    const layerProgress = layer / Math.max(1, layerCount - 1);
    
    // Height position (0 to tornadoHeight) with bias toward bottom
    const heightProgress = Math.pow(Math.random(), 0.7); // Bias toward bottom
    const y = heightProgress * tornadoHeight;
    
    // Tornado diameter interpolation (narrower at bottom, wider at top)
    const diameterAtHeight = baseDiameter + (topDiameter - baseDiameter) * heightProgress;
    
    // Base radius for this particle
    let radius = Math.random() * diameterAtHeight * spiralRadius;
    
    // Add layer offset
    radius += layerProgress * layerOffset;
    
    // Vortex effect - particles closer to center move faster vertically
    const vortexInfluence = (1 - radius / (spiralRadius * diameterAtHeight)) * vortexStrength;
    
    // Spiral calculation (inspired by galaxy but vertical)
    // Increase spiral intensity with height for tornado effect
    const spiralAngle = radius * spiralSpin * (heightProgress + 0.1);
    
    // Branch angle - distribute particles across spiral arms
    const branchAngle = (i % spiralBranches) / spiralBranches * Math.PI * 2;
    
    // Layer rotation offset
    const layerRotation = layer * Math.PI * 2 / layerCount;
    
    // Total rotation angle
    const totalAngle = branchAngle + spiralAngle + layerRotation;
    
    // Add controlled randomness (similar to galaxy)
    const randomFactor = spiralRandomness * radius;
    const randomX = Math.pow(Math.random(), spiralRandomnessPower) * 
                   (Math.random() < 0.5 ? 1 : -1) * randomFactor;
    const randomY = Math.pow(Math.random(), spiralRandomnessPower) * 
                   (Math.random() < 0.5 ? 1 : -1) * randomFactor * 0.3; // Less Y randomness
    const randomZ = Math.pow(Math.random(), spiralRandomnessPower) * 
                   (Math.random() < 0.5 ? 1 : -1) * randomFactor;
    
    // Final positions
    positions[i3] = Math.cos(totalAngle) * radius + randomX;
    positions[i3 + 1] = y + randomY;
    positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;
  }
  
  return positions;
};

/**
 * Generate particle positions for explosion pattern (radial burst)
 */
export const generateExplosion = (count, radius, minRadius = null) => {
  const positions = new Float32Array(count * 3);
  const actualMinRadius = minRadius || radius * 0.7;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = actualMinRadius + Math.random() * (radius - actualMinRadius);
    
    positions[i3] = Math.cos(angle) * distance;     // x
    positions[i3 + 1] = Math.sin(angle) * distance; // y
    positions[i3 + 2] = 0;                          // z
  }
  
  return positions;
};

/**
 * Generate particle positions for sphere pattern
 */
export const generateSphere = (count, radius, heightMultiplier = 1, hollow = false) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    const sphereRadius = hollow ? radius : Math.random() * radius;
    const spherical = new THREE.Spherical(
      sphereRadius,
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    );
    
    const sphereVector = new THREE.Vector3().setFromSpherical(spherical);
    
    positions[i3] = sphereVector.x;
    positions[i3 + 1] = sphereVector.y * heightMultiplier;
    positions[i3 + 2] = sphereVector.z;
  }
  
  return positions;
};

/**
 * Generate particle positions for box/cube pattern
 */
export const generateBox = (count, radius, heightMultiplier = 1, hollow = false) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    if (hollow) {
      // Generate points on box surface only
      const face = Math.floor(Math.random() * 6);
      const u = (Math.random() - 0.5) * 2;
      const v = (Math.random() - 0.5) * 2;
      
      switch (face) {
        case 0: // +X face
          positions[i3] = radius;
          positions[i3 + 1] = u * radius * heightMultiplier;
          positions[i3 + 2] = v * radius;
          break;
        case 1: // -X face
          positions[i3] = -radius;
          positions[i3 + 1] = u * radius * heightMultiplier;
          positions[i3 + 2] = v * radius;
          break;
        case 2: // +Y face
          positions[i3] = u * radius;
          positions[i3 + 1] = radius * heightMultiplier;
          positions[i3 + 2] = v * radius;
          break;
        case 3: // -Y face
          positions[i3] = u * radius;
          positions[i3 + 1] = -radius * heightMultiplier;
          positions[i3 + 2] = v * radius;
          break;
        case 4: // +Z face
          positions[i3] = u * radius;
          positions[i3 + 1] = v * radius * heightMultiplier;
          positions[i3 + 2] = radius;
          break;
        case 5: // -Z face
          positions[i3] = u * radius;
          positions[i3 + 1] = v * radius * heightMultiplier;
          positions[i3 + 2] = -radius;
          break;
      }
    } else {
      // Generate points within entire box volume
      positions[i3] = (Math.random() - 0.5) * radius * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * radius * 2 * heightMultiplier;
      positions[i3 + 2] = (Math.random() - 0.5) * radius * 2;
    }
  }
  
  return positions;
};

/**
 * Generate particle positions for cone pattern
 */
export const generateCone = (count, radius, height, heightMultiplier = 1, hollow = false) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    const h = Math.random() * height;
    const radiusAtHeight = radius * (1 - h / height);
    const circleRadius = hollow ? radiusAtHeight : Math.random() * radiusAtHeight;
    const angle = Math.random() * Math.PI * 2;
    
    positions[i3] = Math.cos(angle) * circleRadius;
    positions[i3 + 1] = (h - height * 0.5) * heightMultiplier;
    positions[i3 + 2] = Math.sin(angle) * circleRadius;
  }
  
  return positions;
};

/**
 * Generate particle positions for circle/disc pattern
 */
export const generateCircle = (count, radius, height, angle, heightMultiplier = 1, hollow = false) => {
  const positions = new Float32Array(count * 3);
  const angleRad = (angle * Math.PI) / 180;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    const circleRadius = hollow ? radius : Math.random() * radius;
    const circleAngle = Math.random() * Math.PI * 2;
    
    const baseX = Math.cos(circleAngle) * circleRadius;
    const baseZ = Math.sin(circleAngle) * circleRadius;
    const baseY = (Math.random() - 0.5) * height * heightMultiplier;
    
    // Apply rotation around Y-axis
    positions[i3] = baseX * Math.cos(angleRad) - baseZ * Math.sin(angleRad);
    positions[i3 + 1] = baseY;
    positions[i3 + 2] = baseX * Math.sin(angleRad) + baseZ * Math.cos(angleRad);
  }
  
  return positions;
};

/**
 * Generate particle positions for square pattern
 */
export const generateSquare = (count, radius, height, angle, heightMultiplier = 1, hollow = false) => {
  const positions = new Float32Array(count * 3);
  const angleRad = (angle * Math.PI) / 180;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    let squareX, squareZ;
    
    if (hollow) {
      const side = Math.floor(Math.random() * 4);
      const t = Math.random();
      
      switch (side) {
        case 0: // Top edge
          squareX = (t - 0.5) * radius * 2;
          squareZ = radius;
          break;
        case 1: // Right edge
          squareX = radius;
          squareZ = (t - 0.5) * radius * 2;
          break;
        case 2: // Bottom edge
          squareX = (0.5 - t) * radius * 2;
          squareZ = -radius;
          break;
        case 3: // Left edge
          squareX = -radius;
          squareZ = (0.5 - t) * radius * 2;
          break;
      }
    } else {
      squareX = (Math.random() - 0.5) * radius * 2;
      squareZ = (Math.random() - 0.5) * radius * 2;
    }
    
    const squareY = (Math.random() - 0.5) * height * heightMultiplier;
    
    // Apply rotation around Y-axis
    positions[i3] = squareX * Math.cos(angleRad) - squareZ * Math.sin(angleRad);
    positions[i3 + 1] = squareY;
    positions[i3 + 2] = squareX * Math.sin(angleRad) + squareZ * Math.cos(angleRad);
  }
  
  return positions;
};

/**
 * Generate particle positions for spiral pattern
 */
export const generateSpiral = (count, radius, height, heightMultiplier = 1, turns = 2, reverse = false) => {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const normalizedIndex = i / count;
    
    const spiralAngle = normalizedIndex * Math.PI * 2 * turns;
    const spiralRadius = normalizedIndex * radius;
    const spiralHeight = (normalizedIndex - 0.5) * height * heightMultiplier;
    
    const finalAngle = reverse ? -spiralAngle : spiralAngle;
    
    positions[i3] = Math.cos(finalAngle) * spiralRadius;
    positions[i3 + 1] = spiralHeight;
    positions[i3 + 2] = Math.sin(finalAngle) * spiralRadius;
  }
  
  return positions;
};

/**
 * Generate particle positions for wave pattern
 */
export const generateWave = (count, radius, height, angle, heightMultiplier = 1, frequency = 3, amplitude = 0.5) => {
  const positions = new Float32Array(count * 3);
  const angleRad = (angle * Math.PI) / 180;
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const normalizedIndex = i / count;
    
    const waveX = (normalizedIndex - 0.5) * radius * 2;
    const waveY = Math.sin(normalizedIndex * Math.PI * frequency) * height * amplitude * heightMultiplier;
    const waveZ = (Math.random() - 0.5) * radius * 0.2;
    
    // Apply rotation around Y-axis
    positions[i3] = waveX * Math.cos(angleRad) - waveZ * Math.sin(angleRad);
    positions[i3 + 1] = waveY;
    positions[i3 + 2] = waveX * Math.sin(angleRad) + waveZ * Math.cos(angleRad);
  }
  
  return positions;
};

/**
 * Main function to generate positions based on shape type
 * Now supports async GLB loading
 */
export const generatePositions = async (shape, count, radius, height = 2, angle = 0, heightMultiplier = 1, options = {}) => {
  const {
    hollow = false,
    turns = 2,
    frequency = 3,
    amplitude = 0.5,
    reverse = false,
    glbPath = '/models/sqMesh.glb', // Default path for GLB
    // === TORNADO PARAMETERS ===
    tornadoHeight = 8.0,
    spiralBranches = 3,
    spiralSpin = 2.0,
    spiralRadius = 2.0,
    baseDiameter = 0.5,
    topDiameter = 3.0,
    spiralRandomness = 0.2,
    spiralRandomnessPower = 3,
    layerCount = 1,
    layerOffset = 0.5,
    vortexStrength = 1.0
  } = options;
  
  switch (shape) {
    case 'tornado':
      return generateTornado(
        count, 
        tornadoHeight, 
        spiralBranches, 
        spiralSpin, 
        spiralRadius, 
        baseDiameter, 
        topDiameter, 
        spiralRandomness, 
        spiralRandomnessPower, 
        layerCount, 
        layerOffset, 
        vortexStrength
      );
    case 'glb':
    case 'model':
      // Handle GLB asynchronously
      return await generateGLB(count, glbPath, radius, heightMultiplier, options);
    case 'explosion':
      return generateExplosion(count, radius, options.minRadius);
    case 'sphere':
      return generateSphere(count, radius, heightMultiplier, hollow);
    case 'box':
      return generateBox(count, radius, heightMultiplier, hollow);
    case 'cone':
      return generateCone(count, radius, height, heightMultiplier, hollow);
    case 'circle':
      return generateCircle(count, radius, height, angle, heightMultiplier, hollow);
    case 'square':
      return generateSquare(count, radius, height, angle, heightMultiplier, hollow);
    case 'spiral':
      return generateSpiral(count, radius, height, heightMultiplier, turns, reverse);
    case 'wave':
      return generateWave(count, radius, height, angle, heightMultiplier, frequency, amplitude);
    default:
      console.warn(`Unknown shape: ${shape}, falling back to explosion`);
      return generateExplosion(count, radius);
  }
};

/**
 * Synchronous version of generatePositions (doesn't support GLB)
 */
export const generatePositionsSync = (shape, count, radius, height = 2, angle = 0, heightMultiplier = 1, options = {}) => {
  if (shape === 'glb' || shape === 'model') {
    console.warn('GLB shapes require async loading, falling back to explosion');
    return generateExplosion(count, radius);
  }
  
  // Remove async/await and call generatePositions normally
  return generatePositions(shape, count, radius, height, angle, heightMultiplier, options);
};

/**
 * Get available shape types
 */
export const getAvailableShapes = () => {
  return [
    'explosion', 'sphere', 'box', 'cone', 'circle', 
    'square', 'spiral', 'wave', 'glb', 'model', 'tornado'
  ];
};

/**
 * Create a fallback geometry for immediate rendering
 */
export const createFallbackGeometry = () => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, -1, 0, 0]);
  const sizes = new Float32Array([1, 1, 1]);
  const timeMultipliers = new Float32Array([1, 1, 1]);
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1));
  geometry.computeBoundingSphere();
  
  return geometry;
};

export default {
  generatePositions,
  generatePositionsSync,
  generateGLB,
  generateTornado,
  generateExplosion,
  generateSphere,
  generateBox,
  generateCone,
  generateCircle,
  generateSquare,
  generateSpiral,
  generateWave,
  generateFlowFieldMesh,
  loadGLBModel,
  getAvailableShapes,
  createFallbackGeometry
};