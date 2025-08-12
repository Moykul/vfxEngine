/**
 * Stores all shapes for vfx.
 * 
 * @author Moykul O'Conghaile
 * @version 1.0
 * @class shapeGenerators
 */
// shapeGenerators.js - Particle position generation utilities
//
// USAGE:
// import { generatePositions, generateExplosion, generateSphere } from './shapeGenerators';
// 
// const positions = generatePositions('sphere', 1000, 2.0, 3.0, 45, 1.2);
// const explosionPositions = generateExplosion(500, 1.5);
//
import * as THREE from 'three';

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
 */
export const generatePositions = (shape, count, radius, height = 2, angle = 0, heightMultiplier = 1, options = {}) => {
  const {
    hollow = false,
    turns = 2,
    frequency = 3,
    amplitude = 0.5,
    reverse = false
  } = options;
  
  switch (shape) {
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
 * Get available shape types
 */
export const getAvailableShapes = () => {
  return [
    'explosion', 'sphere', 'box', 'cone', 'circle', 
    'square', 'spiral', 'wave'
  ];
};

export default {
  generatePositions,
  generateExplosion,
  generateSphere,
  generateBox,
  generateCone,
  generateCircle,
  generateSquare,
  generateSpiral,
  generateWave,
  getAvailableShapes
};