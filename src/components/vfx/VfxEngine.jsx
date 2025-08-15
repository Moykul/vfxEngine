import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { generatePositions } from '../../utils/shapeGenerators.js';
import { useVfxTextures } from '../../hooks/index.js';
// FIXED_VFX_SETTINGS import removed to avoid loading VfxParameters.js

// Import shaders
import vfxVertexShader from '../../shaders/vfxShaders/vertex.glsl';
import vfxFragmentShader from '../../shaders/vfxShaders/fragment.glsl';

// Create shader material
const VFXMaterial = shaderMaterial(
  {
    // === EXISTING UNIFORMS (keep all of these) ===
    uSize: 0.1,
    uResolution: new THREE.Vector2(1024, 1024),
    uTexture: null,
    uColor: new THREE.Color('#ff6030'),
    uColorEnd: new THREE.Color('#ff0030'),
    uProgress: 0.0,
    uTime: 0.0,
    uStreakLength: 0.0,
    uTurbulence: 0.0,
    uDirectionalForce: new THREE.Vector3(0, 0, 0),
    uGravity: 0.0,
    uUseGradient: 0.0,
    uMotionBlur: 0.0,
    uOpacity: 1.0,
    
    // === NEW TORNADO UNIFORMS ===
    uTornadoEnabled: 0.0,
    uTornadoHeight: 8.0,
    uVerticalSpeed: 1.0,
    uRotationSpeed: 1.0,
    uVortexStrength: 1.0,
    uSpiralSpin: 2.0,
    uBaseDiameter: 0.5,
    uTopDiameter: 3.0,
    uHeightColorGradient: 0.0
  },
  vfxVertexShader,
  vfxFragmentShader
);

extend({ VFXMaterial });

const VfxEngine = ({ 
  // Core animatable props (8 total)
  positionX = 0,
  positionY = 0,
  positionZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  scale = 1,
  opacity = 1.0,
  
  // Color props
  color = '#ff6030',
  colorEnd = '#ff0030',
  useGradient = false,
  blendMode = 0,
  
  // Basic props
  pCount = 800,
  duration = 3.0,
  pSize = 0.4,
  spread = 2,
  pAge = 1.0,
  
  // Physics props
  gravity = 0,
  directionalForceX = 0,
  directionalForceY = 0,
  directionalForceZ = 0,
  turbulence = 0,
  streakLength = 0,
  
  // Shape props
  shape = 'explosion',
  shapeHeight = 2.0,
  shapeAngle = 0,
  heightMultiplier = 1.0,
  sizeVariation = 0.5,
  timeVariation = 0.4,
  
  // Animation props
  animationPreset = 'none',
  particleTexture = 'Circle',
  motionBlur = false,
  
  // === NEW TORNADO PROPS ===
  tornadoEnabled = false,
  tornadoHeight = 8.0,
  verticalSpeed = 1.0,
  rotationSpeed = 1.0,
  vortexStrength = 1.0,
  spiralSpin = 2.0,
  baseDiameter = 0.5,
  topDiameter = 3.0,
  heightColorGradient = false,
  
  // Control props
  onComplete,
  
  // ✅ SIMPLIFIED: Single data source - allVfxValues takes priority
  allVfxValues = null
}) => {
  // Refs
  const meshRef = useRef();
  const materialRef = useRef();
  const startTimeRef = useRef(0);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Hooks
  const { size: canvasSize } = useThree();
  const { textures } = useVfxTextures();

  // ✅ CORRECTED: Include tornado values in effectiveValues
  const effectiveValues = useMemo(() => {
    // If allVfxValues provided, use it directly
    if (allVfxValues) {
      return allVfxValues;
    }
    
    // Otherwise use individual props INCLUDING tornado props
    return { 
      positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scale, opacity, 
      color, colorEnd, useGradient, blendMode, pCount, duration, 
      pSize, spread, pAge, gravity, directionalForceX, 
      directionalForceY, directionalForceZ, turbulence, streakLength, shape, 
      shapeHeight, shapeAngle, heightMultiplier, sizeVariation, timeVariation, 
      animationPreset, particleTexture, motionBlur,
      // === TORNADO VALUES ===
      tornadoEnabled, tornadoHeight, verticalSpeed, rotationSpeed, vortexStrength,
      spiralSpin, baseDiameter, topDiameter, heightColorGradient
    };
  }, [allVfxValues, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, 
      scale, opacity, color, colorEnd, useGradient, blendMode, pCount, 
      duration, pSize, spread, pAge, gravity, 
      directionalForceX, directionalForceY, directionalForceZ, turbulence, 
      streakLength, shape, shapeHeight, shapeAngle, heightMultiplier, 
      sizeVariation, timeVariation, animationPreset, particleTexture, motionBlur,
      // === TORNADO DEPENDENCIES ===
      tornadoEnabled, tornadoHeight, verticalSpeed, rotationSpeed, vortexStrength,
      spiralSpin, baseDiameter, topDiameter, heightColorGradient]);

  // ✅ CORRECTED: Fallback geometry with aHeightFactor
  const createFallbackGeometry = useMemo(() => {
    return () => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array([0, 0, 0, 1, 0, 0, -1, 0, 0]);
      const sizes = new Float32Array([1, 1, 1]);
      const timeMultipliers = new Float32Array([1, 1, 1]);
      const heightFactors = new Float32Array([0.5, 0.5, 0.5]); // NEW
    
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
      geo.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1));
      geo.setAttribute('aHeightFactor', new THREE.Float32BufferAttribute(heightFactors, 1)); // NEW
      geo.computeBoundingSphere();
    
      return geo;
    };
  }, []);

  // Geometry state generated asynchronously (supports GLB and avoids Promise issues)
  const [geometry, setGeometry] = useState(() => createFallbackGeometry());

  // ✅ CORRECTED: Geometry generation with tornado support
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ✅ CORRECTED: Pass tornado options to generatePositions
        const tornadoOptions = effectiveValues.tornadoEnabled ? {
          tornadoHeight: effectiveValues.tornadoHeight,
          spiralBranches: 3, // Could be made configurable later
          spiralSpin: effectiveValues.spiralSpin,
          spiralRadius: 2.0, // Could be made configurable later
          baseDiameter: effectiveValues.baseDiameter,
          topDiameter: effectiveValues.topDiameter,
          spiralRandomness: 0.2, // Could be made configurable later
          spiralRandomnessPower: 3, // Could be made configurable later
          layerCount: 1, // Could be made configurable later
          layerOffset: 0.5, // Could be made configurable later
          vortexStrength: effectiveValues.vortexStrength
        } : {};

        const positions = await generatePositions(
          effectiveValues.shape,
          effectiveValues.pCount,
          effectiveValues.spread,
          effectiveValues.shapeHeight || 2.0,
          effectiveValues.shapeAngle || 0,
          effectiveValues.heightMultiplier || 1.0,
          tornadoOptions // ✅ CORRECTED: Pass tornado options
        );

        if (!positions || !positions.length) {
          if (!cancelled) setGeometry(createFallbackGeometry());
          return;
        }

        // ✅ CORRECTED: Generate attributes including aHeightFactor
        const sizes = new Float32Array(effectiveValues.pCount);
        const timeMultipliers = new Float32Array(effectiveValues.pCount);
        const heightFactors = new Float32Array(effectiveValues.pCount); // NEW
        
        for (let i = 0; i < effectiveValues.pCount; i++) {
          sizes[i] = Math.random() * (effectiveValues.sizeVariation || 0.5) + (1 - (effectiveValues.sizeVariation || 0.5) / 2);
          timeMultipliers[i] = 1 + Math.random() * (effectiveValues.timeVariation || 0.4);
          
          // ✅ CORRECTED: Calculate height factor for tornado effects
          if (effectiveValues.tornadoEnabled && effectiveValues.shape === 'tornado') {
            // For tornado shapes, calculate height factor based on Y position
            const y = positions[i * 3 + 1]; // Y position
            const tornadoHeight = effectiveValues.tornadoHeight || 8.0;
            heightFactors[i] = Math.max(0, Math.min(1, y / tornadoHeight));
          } else {
            // For non-tornado shapes, use neutral height factor
            heightFactors[i] = 0.5;
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
        geo.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1));
        geo.setAttribute('aHeightFactor', new THREE.Float32BufferAttribute(heightFactors, 1)); // NEW
        geo.computeBoundingSphere();

        if (!cancelled) setGeometry(geo);
      } catch (error) {
        console.error('Error creating geometry:', error);
        if (!cancelled) setGeometry(createFallbackGeometry());
      }
    })();

    return () => { cancelled = true; };
  }, [
    effectiveValues.shape,
    effectiveValues.pCount,
    effectiveValues.spread,
    effectiveValues.shapeHeight,
    effectiveValues.shapeAngle,
    effectiveValues.heightMultiplier,
    effectiveValues.sizeVariation,
    effectiveValues.timeVariation,
    // ✅ CORRECTED: Add tornado dependencies
    effectiveValues.tornadoEnabled,
    effectiveValues.tornadoHeight,
    effectiveValues.spiralSpin,
    effectiveValues.baseDiameter,
    effectiveValues.topDiameter,
    effectiveValues.vortexStrength,
    createFallbackGeometry
  ]);

  // Handle animation triggers only (not real-time updates)
  useEffect(() => {
    if (effectiveValues.trigger) {
      console.log('🚀 VfxEngine: Animation trigger fired', effectiveValues.tornadoEnabled ? '(Tornado mode)' : '');
      setIsPlaying(true);
      startTimeRef.current = performance.now() / 1000;
    }
  }, [effectiveValues.trigger, effectiveValues.tornadoEnabled]);

  // ✅ CORRECTED: Update material uniforms including tornado uniforms
  useEffect(() => {
    if (!materialRef.current) return;

    const material = materialRef.current;
    
    // Basic uniforms - update in real-time
    material.uniforms.uSize.value = effectiveValues.pSize || 0.4;
    material.uniforms.uResolution.value.set(
      canvasSize.width * Math.min(window.devicePixelRatio, 2),
      canvasSize.height * Math.min(window.devicePixelRatio, 2)
    );
    
    // Colors - update in real-time
    material.uniforms.uColor.value = new THREE.Color(effectiveValues.color || '#ff6030');
    material.uniforms.uColorEnd.value = new THREE.Color(effectiveValues.colorEnd || '#ff0030');
    material.uniforms.uUseGradient.value = effectiveValues.useGradient ? 1.0 : 0.0;
    
    // Physics - update in real-time
    material.uniforms.uGravity.value = effectiveValues.gravity || 0;
    material.uniforms.uTurbulence.value = effectiveValues.turbulence || 0;
    material.uniforms.uStreakLength.value = effectiveValues.streakLength || 0;
    material.uniforms.uDirectionalForce.value.set(
      effectiveValues.directionalForceX || 0, 
      effectiveValues.directionalForceY || 0, 
      effectiveValues.directionalForceZ || 0
    );
    material.uniforms.uMotionBlur.value = effectiveValues.motionBlur ? 1.0 : 0.0;
    material.uniforms.uOpacity.value = effectiveValues.opacity || 1.0;
    
    // ✅ CORRECTED: NEW TORNADO UNIFORM UPDATES
    material.uniforms.uTornadoEnabled.value = effectiveValues.tornadoEnabled ? 1.0 : 0.0;
    material.uniforms.uTornadoHeight.value = effectiveValues.tornadoHeight || 8.0;
    material.uniforms.uVerticalSpeed.value = effectiveValues.verticalSpeed || 1.0;
    material.uniforms.uRotationSpeed.value = effectiveValues.rotationSpeed || 1.0;
    material.uniforms.uVortexStrength.value = effectiveValues.vortexStrength || 1.0;
    material.uniforms.uSpiralSpin.value = effectiveValues.spiralSpin || 2.0;
    material.uniforms.uBaseDiameter.value = effectiveValues.baseDiameter || 0.5;
    material.uniforms.uTopDiameter.value = effectiveValues.topDiameter || 3.0;
    material.uniforms.uHeightColorGradient.value = effectiveValues.heightColorGradient ? 1.0 : 0.0;
    
    // Texture - update in real-time
    if (textures.length > 0) {
      const texture = textures.find(t => t.name === (effectiveValues.particleTexture || 'Circle')) || textures[0];
      material.uniforms.uTexture.value = texture;
    }

    material.needsUpdate = true;
    
    // Debug tornado mode changes
    if (effectiveValues.tornadoEnabled) {
      console.log('🌪️ Tornado uniforms updated:', {
        enabled: effectiveValues.tornadoEnabled,
        height: effectiveValues.tornadoHeight,
        rotationSpeed: effectiveValues.rotationSpeed,
        vortexStrength: effectiveValues.vortexStrength
      });
    }
  }, [effectiveValues, canvasSize, textures]);

  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;

    const elapsedTime = state.clock.elapsedTime;
    
    if (isPlaying) {
      const animationTime = elapsedTime - (startTimeRef.current - performance.now() / 1000 + state.clock.elapsedTime);
      const progress = Math.min(animationTime / (effectiveValues.duration || 3.0), 1);

      materialRef.current.uniforms.uProgress.value = progress;
      materialRef.current.uniforms.uTime.value = elapsedTime;

      // Complete animation
      if (progress >= 1) {
        setIsPlaying(false);
        if (onComplete) onComplete();
      }
    } else {
      // Design mode - show particles
      materialRef.current.uniforms.uProgress.value = effectiveValues.tornadoEnabled ? 0.5 : 0.3;
      materialRef.current.uniforms.uTime.value = elapsedTime;
    }
  });

  // Convert blendMode to THREE.js constant
  const getBlendMode = (mode) => {
    switch (mode) {
      case 1: return THREE.NormalBlending;
      case 2: return THREE.MultiplyBlending;
      case 3: return THREE.SubtractiveBlending;
      default: return THREE.AdditiveBlending;
    }
  };

  return (
    <points 
      ref={meshRef}
      geometry={geometry}
      position={[effectiveValues.positionX || 0, effectiveValues.positionY || 0, effectiveValues.positionZ || 0]} 
      scale={[effectiveValues.scale || 1, effectiveValues.scale || 1, effectiveValues.scale || 1]} 
      rotation={[
        (effectiveValues.rotationX || 0) * Math.PI / 180, 
        (effectiveValues.rotationY || 0) * Math.PI / 180, 
        (effectiveValues.rotationZ || 0) * Math.PI / 180
      ]}
    >
      <vFXMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={getBlendMode(effectiveValues.blendMode || 0)}
        opacity={effectiveValues.opacity || 1.0}
      />
    </points>
  );
};

export default VfxEngine;