import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { generatePositions } from '../../utils/shapeGenerators.js';
import { useVfxTextures, useVfxSprites } from '../../hooks/index.js';
import { useVfxSpritesheets } from '../../hooks/useVfxSpritesheets.js';
// FIXED_VFX_SETTINGS import removed to avoid loading VfxParameters.js

// Import shaders
import vfxVertexShader from '../../shaders/vfxShaders/vertex.glsl';
import vfxFragmentShader from '../../shaders/vfxShaders/fragment.glsl';

// Create shader material with spritesheet support
const VFXMaterial = shaderMaterial(
  {
    // === EXISTING UNIFORMS ===
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
  // === TRAIL UNIFORMS ===
  uTrailEnabled: 0.0,
  uTrailLength: 4.0,
  uTrailDamping: 1.2,
  uTrailSize: 0.02,
    
    // === NEW SPRITESHEET UNIFORMS ===
    uUseSpritesheet: 0.0,        // Enable/disable spritesheet animation
    uFramesX: 1.0,               // Number of frames horizontally
    uFramesY: 1.0,               // Number of frames vertically
    uTotalFrames: 1.0,           // Total number of frames
    uFrameRate: 24.0,            // Animation frame rate
    uAnimationMode: 0.0,         // 0=once, 1=loop, 2=ping-pong
    uRandomStartFrame: 0.0,      // Random start frame timing
    
    // === TORNADO UNIFORMS ===
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
  
  // === NEW SPRITESHEET PROPS ===
  useSpritesheet = false,
  spritesheetName = 'fire_explosion_4x4',
  spritesheetFrameRate = 24,
  spritesheetAnimationMode = 'once',
  spritesheetRandomStart = false,
  
  // === TORNADO PROPS ===
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
  
  // External resources
  sprites = [],
  
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
  const { spritesheets, getSpritesheetByName } = useVfxSpritesheets();

  // ✅ ENHANCED: Include spritesheet values in effectiveValues
  const effectiveValues = useMemo(() => {
    // If allVfxValues provided, use it directly
    if (allVfxValues) {
      return allVfxValues;
    }
    
    // Otherwise use individual props INCLUDING spritesheet props
    return { 
      positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scale, opacity, 
      color, colorEnd, useGradient, blendMode, pCount, duration, 
      pSize, spread, pAge, gravity, directionalForceX, 
      directionalForceY, directionalForceZ, turbulence, streakLength, shape, 
      shapeHeight, shapeAngle, heightMultiplier, sizeVariation, timeVariation, 
      animationPreset, particleTexture, motionBlur,
      // === SPRITESHEET VALUES ===
      useSpritesheet, spritesheetName, spritesheetFrameRate, 
      spritesheetAnimationMode, spritesheetRandomStart,
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
      // === SPRITESHEET DEPENDENCIES ===
      useSpritesheet, spritesheetName, spritesheetFrameRate, 
      spritesheetAnimationMode, spritesheetRandomStart,
      // === TORNADO DEPENDENCIES ===
      tornadoEnabled, tornadoHeight, verticalSpeed, rotationSpeed, vortexStrength,
      spiralSpin, baseDiameter, topDiameter, heightColorGradient]);

  // ✅ NEW: Animation preset function that matches UI options
  const applyAnimationPreset = (progress, mesh) => {
    if (!mesh || !effectiveValues.animationPreset || effectiveValues.animationPreset === 'none') return;
    
    const presetProgress = Math.min(progress, 1);
    const basePosition = [
      effectiveValues.positionX || 0,
      effectiveValues.positionY || 0, 
      effectiveValues.positionZ || 0
    ];
    const baseScale = effectiveValues.scale || 1;
    
    switch (effectiveValues.animationPreset) {
      case 'fadeIn':
        // Gradual fade in with scale
        const fadeInScale = baseScale * Math.min(presetProgress * 2, 1);
        mesh.scale.set(fadeInScale, fadeInScale, fadeInScale);
        break;
        
      case 'fadeOut':
        // Gradual fade out with scale
        const fadeOutScale = baseScale * Math.max(1 - presetProgress, 0.1);
        mesh.scale.set(fadeOutScale, fadeOutScale, fadeOutScale);
        break;
        
      case 'spiral':
        // Spiral rotation with upward movement
        const spiralRadians = presetProgress * Math.PI * 4; // 2 full rotations
        mesh.rotation.y = spiralRadians;
        mesh.position.y = basePosition[1] + presetProgress * 2;
        break;
        
      case 'burst':
        // Quick scale burst at the beginning
        const burstScale = presetProgress < 0.3 ? 
          baseScale * (1 + Math.sin(presetProgress * Math.PI * 10) * 0.5) : 
          baseScale;
        mesh.scale.set(burstScale, burstScale, burstScale);
        break;
        
      case 'gravity':
        // Simulated gravity fall
        const gravityY = basePosition[1] - (presetProgress * presetProgress * 3);
        mesh.position.y = gravityY;
        break;
    }
  };

  // ✅ CORRECTED: Fallback geometry with aHeightFactor
  const createFallbackGeometry = useMemo(() => {
    return () => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array([0, 0, 0, 1, 0, 0, -1, 0, 0]);
      const sizes = new Float32Array([1, 1, 1]);
      const timeMultipliers = new Float32Array([1, 1, 1]);
      const heightFactors = new Float32Array([0.5, 0.5, 0.5]);
    
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
      geo.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1));
      geo.setAttribute('aHeightFactor', new THREE.Float32BufferAttribute(heightFactors, 1));
      geo.computeBoundingSphere();
    
      return geo;
    };
  }, []);

  // Geometry state generated asynchronously
  const [geometry, setGeometry] = useState(() => createFallbackGeometry());

  // ✅ CORRECTED: Geometry generation with tornado support
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tornadoOptions = effectiveValues.tornadoEnabled ? {
          tornadoHeight: effectiveValues.tornadoHeight,
          spiralBranches: 3,
          spiralSpin: effectiveValues.spiralSpin,
          spiralRadius: 2.0,
          baseDiameter: effectiveValues.baseDiameter,
          topDiameter: effectiveValues.topDiameter,
          spiralRandomness: 0.2,
          spiralRandomnessPower: 3,
          layerCount: 1,
          layerOffset: 0.5,
          vortexStrength: effectiveValues.vortexStrength
        } : {};

        const positions = await generatePositions(
          effectiveValues.shape,
          effectiveValues.pCount,
          effectiveValues.spread,
          effectiveValues.shapeHeight || 2.0,
          effectiveValues.shapeAngle || 0,
          effectiveValues.heightMultiplier || 1.0,
          tornadoOptions
        );

        if (!positions || !positions.length) {
          if (!cancelled) setGeometry(createFallbackGeometry());
          return;
        }

        const sizes = new Float32Array(effectiveValues.pCount);
        const timeMultipliers = new Float32Array(effectiveValues.pCount);
        const heightFactors = new Float32Array(effectiveValues.pCount);
        
        for (let i = 0; i < effectiveValues.pCount; i++) {
          sizes[i] = Math.random() * (effectiveValues.sizeVariation || 0.5) + (1 - (effectiveValues.sizeVariation || 0.5) / 2);
          timeMultipliers[i] = 1 + Math.random() * (effectiveValues.timeVariation || 0.4);
          
          if (effectiveValues.tornadoEnabled && effectiveValues.shape === 'tornado') {
            const y = positions[i * 3 + 1];
            const tornadoHeight = effectiveValues.tornadoHeight || 8.0;
            heightFactors[i] = Math.max(0, Math.min(1, y / tornadoHeight));
          } else {
            heightFactors[i] = 0.5;
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
        geo.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliers, 1));
        geo.setAttribute('aHeightFactor', new THREE.Float32BufferAttribute(heightFactors, 1));
        geo.computeBoundingSphere();

        if (!cancelled) setGeometry(geo);
      } catch (error) {
        console.error('Error creating geometry:', error);
        if (!cancelled) setGeometry(createFallbackGeometry());
      }
    })();

    return () => { cancelled = true; };
  }, [
    effectiveValues.shape, effectiveValues.pCount, effectiveValues.spread,
    effectiveValues.shapeHeight, effectiveValues.shapeAngle, effectiveValues.heightMultiplier,
    effectiveValues.sizeVariation, effectiveValues.timeVariation,
    effectiveValues.tornadoEnabled, effectiveValues.tornadoHeight, effectiveValues.spiralSpin,
    effectiveValues.baseDiameter, effectiveValues.topDiameter, effectiveValues.vortexStrength,
    createFallbackGeometry
  ]);

  // Handle animation triggers
  useEffect(() => {
    if (effectiveValues.trigger) {
      console.log('🚀 VfxEngine: Animation trigger fired', 
        effectiveValues.useSpritesheet ? '(Spritesheet mode)' : 
        effectiveValues.tornadoEnabled ? '(Tornado mode)' : ''
      );
      setIsPlaying(true);
      startTimeRef.current = performance.now() / 1000;
    }
  }, [effectiveValues.trigger, effectiveValues.useSpritesheet, effectiveValues.tornadoEnabled]);

  // ✅ ENHANCED: Material uniforms with spritesheet support
  useEffect(() => {
    if (!materialRef.current) return;

    const material = materialRef.current;
    
    // Basic uniforms
    material.uniforms.uSize.value = effectiveValues.pSize || 0.4;
    material.uniforms.uResolution.value.set(
      canvasSize.width * Math.min(window.devicePixelRatio, 2),
      canvasSize.height * Math.min(window.devicePixelRatio, 2)
    );
    
    // Colors
    material.uniforms.uColor.value = new THREE.Color(effectiveValues.color || '#ff6030');
    material.uniforms.uColorEnd.value = new THREE.Color(effectiveValues.colorEnd || '#ff0030');
    material.uniforms.uUseGradient.value = effectiveValues.useGradient ? 1.0 : 0.0;
    
    // Physics
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
    
    // Tornado uniforms
    material.uniforms.uTornadoEnabled.value = effectiveValues.tornadoEnabled ? 1.0 : 0.0;
    material.uniforms.uTornadoHeight.value = effectiveValues.tornadoHeight || 8.0;
    material.uniforms.uVerticalSpeed.value = effectiveValues.verticalSpeed || 1.0;
    material.uniforms.uRotationSpeed.value = effectiveValues.rotationSpeed || 1.0;
    material.uniforms.uVortexStrength.value = effectiveValues.vortexStrength || 1.0;
    material.uniforms.uSpiralSpin.value = effectiveValues.spiralSpin || 2.0;
    material.uniforms.uBaseDiameter.value = effectiveValues.baseDiameter || 0.5;
    material.uniforms.uTopDiameter.value = effectiveValues.topDiameter || 3.0;
    material.uniforms.uHeightColorGradient.value = effectiveValues.heightColorGradient ? 1.0 : 0.0;
    
    // ✅ NEW: Spritesheet uniforms
    material.uniforms.uUseSpritesheet.value = effectiveValues.useSpritesheet ? 1.0 : 0.0;
    material.uniforms.uRandomStartFrame.value = effectiveValues.spritesheetRandomStart ? 1.0 : 0.0;
    material.uniforms.uFrameRate.value = effectiveValues.spritesheetFrameRate || 24;
    
    // Convert animation mode string to number
    const animationModeMap = { 'once': 0, 'loop': 1, 'ping-pong': 2 };
    material.uniforms.uAnimationMode.value = animationModeMap[effectiveValues.spritesheetAnimationMode] || 0;
    
    // ✅ ENHANCED: Texture selection with spritesheet support
    if (effectiveValues.useSpritesheet && spritesheets.length > 0) {
      // Use spritesheet
      const spritesheet = getSpritesheetByName(effectiveValues.spritesheetName);
      if (spritesheet) {
        material.uniforms.uTexture.value = spritesheet;
        material.uniforms.uFramesX.value = spritesheet.framesX;
        material.uniforms.uFramesY.value = spritesheet.framesY;
        material.uniforms.uTotalFrames.value = spritesheet.totalFrames;
        
        console.log('🎬 Using spritesheet:', spritesheet.name, {
          frames: `${spritesheet.framesX}x${spritesheet.framesY}`,
          total: spritesheet.totalFrames,
          mode: effectiveValues.spritesheetAnimationMode
        });
      }
    } else {
      // Use static texture (existing logic)
      const selectedTextureName = effectiveValues.particleTexture || 'Circle';
      
      // Reset spritesheet uniforms when not using spritesheets
      material.uniforms.uFramesX.value = 1.0;
      material.uniforms.uFramesY.value = 1.0;
      material.uniforms.uTotalFrames.value = 1.0;
      
      // Try extended textures first
      if (sprites && sprites.length > 0) {
        const sprite = sprites.find(s => s.name === selectedTextureName);
        if (sprite) {
          material.uniforms.uTexture.value = sprite;
          console.log('🖼️ Using extended texture:', sprite.name);
          material.needsUpdate = true;
          return;
        }
      }
      
      // Fall back to basic particle textures
      if (textures.length > 0) {
        const texture = textures.find(t => t.name === selectedTextureName);
        if (texture) {
          material.uniforms.uTexture.value = texture;
          console.log('🔹 Using basic texture:', texture.name);
        } else {
          material.uniforms.uTexture.value = textures[0];
          console.log('⚠️ Texture not found, using fallback:', textures[0].name);
        }
      }
    }
  // === TRAIL UNIFORMS SETTING ===
  material.uniforms.uTrailEnabled.value = effectiveValues.trailEnabled ? 1.0 : 0.0;
  material.uniforms.uTrailLength.value = effectiveValues.trailLength || 4.0;
  material.uniforms.uTrailDamping.value = effectiveValues.trailDamping || 1.2;
  material.uniforms.uTrailSize.value = effectiveValues.trailSize || 0.02;

    material.needsUpdate = true;
    
    // Debug spritesheet mode changes
    if (effectiveValues.useSpritesheet) {
      console.log('🎬 Spritesheet uniforms updated:', {
        enabled: effectiveValues.useSpritesheet,
        name: effectiveValues.spritesheetName,
        frameRate: effectiveValues.spritesheetFrameRate,
        mode: effectiveValues.spritesheetAnimationMode
      });
    }
  }, [effectiveValues, canvasSize, textures, sprites, spritesheets, getSpritesheetByName]);

  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;

    const elapsedTime = state.clock.elapsedTime;
    
    if (isPlaying) {
      const animationTime = elapsedTime - (startTimeRef.current - performance.now() / 1000 + state.clock.elapsedTime);
      const progress = Math.min(animationTime / (effectiveValues.duration || 3.0), 1);

      materialRef.current.uniforms.uProgress.value = progress;
      materialRef.current.uniforms.uTime.value = elapsedTime;

      // ✅ NEW: Apply animation preset to mesh continuously during animation
      if (meshRef.current && progress > 0) {
        applyAnimationPreset(progress, meshRef.current);
      }

      // Complete animation
      if (progress >= 1) {
        setIsPlaying(false);
        if (onComplete) onComplete();
      }
    } else {
      // Design mode - show particles
      const designProgress = effectiveValues.useSpritesheet ? 0.5 : 
                           effectiveValues.tornadoEnabled ? 0.5 : 0.3;
      materialRef.current.uniforms.uProgress.value = designProgress;
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

  // Configure render properties
  const renderProps = {
    ref: meshRef,
    geometry: geometry,
    position: [effectiveValues.positionX || 0, effectiveValues.positionY || 0, effectiveValues.positionZ || 0],
    scale: [effectiveValues.scale || 1, effectiveValues.scale || 1, effectiveValues.scale || 1],
    rotation: [
      (effectiveValues.rotationX || 0) * Math.PI / 180,
      (effectiveValues.rotationY || 0) * Math.PI / 180,
      (effectiveValues.rotationZ || 0) * Math.PI / 180
    ]
  };

  // Material props
  const materialProps = {
    ref: materialRef,
    transparent: true,
    depthWrite: false,
    blending: getBlendMode(effectiveValues.blendMode || 0),
    opacity: effectiveValues.opacity || 1.0
  };

  return (
    <points {...renderProps}>
      <vFXMaterial {...materialProps} />
    </points>
  );
};

export default VfxEngine;