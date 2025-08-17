// VFX Custom Hooks - Enhanced with Gravity Support
//
// HOOKS INCLUDED:
// - useVfxSettings: Settings state management
// - useVfxTextures: Texture loading and management  
// - useVfxAnimation: Animation state and frame loop logic
// - useVfxGeometry: Geometry generation and updates
//
import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Import particle textures
import circleTexture from '../assets/particles/circle.png';
import heartTexture from '../assets/particles/heart.png';
import pointTexture from '../assets/particles/point.png';
import pointcrossTexture from '../assets/particles/pointcross.png';
import pointcross2Texture from '../assets/particles/pointcross2.png';
import ringTexture from '../assets/particles/ring.png';
import starTexture from '../assets/particles/star.png';
import star2Texture from '../assets/particles/star_2.png';

// Import sprite textures
// Circle sprites
import circle01Texture from '../assets/sprites/circle_01.png';
import circle02Texture from '../assets/sprites/circle_02.png';
import circle03Texture from '../assets/sprites/circle_03.png';
import circle04Texture from '../assets/sprites/circle_04.png';
import circle05Texture from '../assets/sprites/circle_05.png';

// Dirt sprites
import dirt01Texture from '../assets/sprites/dirt_01.png';
import dirt02Texture from '../assets/sprites/dirt_02.png';
import dirt03Texture from '../assets/sprites/dirt_03.png';

// Fire sprites
import fire01Texture from '../assets/sprites/fire_01.png';
import fire02Texture from '../assets/sprites/fire_02.png';

// Flame sprites
import flame01Texture from '../assets/sprites/flame_01.png';
import flame02Texture from '../assets/sprites/flame_02.png';
import flame03Texture from '../assets/sprites/flame_03.png';
import flame04Texture from '../assets/sprites/flame_04.png';
import flame05Texture from '../assets/sprites/flame_05.png';
import flame06Texture from '../assets/sprites/flame_06.png';

// Flare sprite
import flare01Texture from '../assets/sprites/flare_01.png';

// Light sprites
import light01Texture from '../assets/sprites/light_01.png';
import light02Texture from '../assets/sprites/light_02.png';
import light03Texture from '../assets/sprites/light_03.png';

// Magic sprites
import magic01Texture from '../assets/sprites/magic_01.png';
import magic02Texture from '../assets/sprites/magic_02.png';
import magic03Texture from '../assets/sprites/magic_03.png';
import magic04Texture from '../assets/sprites/magic_04.png';
import magic05Texture from '../assets/sprites/magic_05.png';

// Muzzle sprites
import muzzle01Texture from '../assets/sprites/muzzle_01.png';
import muzzle02Texture from '../assets/sprites/muzzle_02.png';
import muzzle03Texture from '../assets/sprites/muzzle_03.png';
import muzzle04Texture from '../assets/sprites/muzzle_04.png';
import muzzle05Texture from '../assets/sprites/muzzle_05.png';

// Scorch sprites
import scorch01Texture from '../assets/sprites/scorch_01.png';
import scorch02Texture from '../assets/sprites/scorch_02.png';
import scorch03Texture from '../assets/sprites/scorch_03.png';

// Scratch sprite
import scratch01Texture from '../assets/sprites/scratch_01.png';

// Slash sprites
import slash01Texture from '../assets/sprites/slash_01.png';
import slash02Texture from '../assets/sprites/slash_02.png';
import slash03Texture from '../assets/sprites/slash_03.png';
import slash04Texture from '../assets/sprites/slash_04.png';

// Smoke sprites
import smoke01Texture from '../assets/sprites/smoke_01.png';
import smoke02Texture from '../assets/sprites/smoke_02.png';
import smoke03Texture from '../assets/sprites/smoke_03.png';
import smoke04Texture from '../assets/sprites/smoke_04.png';
import smoke05Texture from '../assets/sprites/smoke_05.png';
import smoke06Texture from '../assets/sprites/smoke_06.png';
import smoke07Texture from '../assets/sprites/smoke_07.png';
import smoke08Texture from '../assets/sprites/smoke_08.png';
import smoke09Texture from '../assets/sprites/smoke_09.png';
import smoke10Texture from '../assets/sprites/smoke_10.png';

// Spark sprites
import spark01Texture from '../assets/sprites/spark_01.png';
import spark02Texture from '../assets/sprites/spark_02.png';
import spark03Texture from '../assets/sprites/spark_03.png';
import spark04Texture from '../assets/sprites/spark_04.png';
import spark05Texture from '../assets/sprites/spark_05.png';
import spark06Texture from '../assets/sprites/spark_06.png';
import spark07Texture from '../assets/sprites/spark_07.png';

// Star sprites
import star01Texture from '../assets/sprites/star_01.png';
import star02Texture from '../assets/sprites/star_02.png';
import star03Texture from '../assets/sprites/star_03.png';
import star04Texture from '../assets/sprites/star_04.png';
import star05Texture from '../assets/sprites/star_05.png';
import star06Texture from '../assets/sprites/star_06.png';
import star07Texture from '../assets/sprites/star_07.png';
import star08Texture from '../assets/sprites/star_08.png';
import star09Texture from '../assets/sprites/star_09.png';

// Symbol sprites
import symbol01Texture from '../assets/sprites/symbol_01.png';
import symbol02Texture from '../assets/sprites/symbol_02.png';

// Trace sprites
import trace01Texture from '../assets/sprites/trace_01.png';
import trace02Texture from '../assets/sprites/trace_02.png';
import trace03Texture from '../assets/sprites/trace_03.png';
import trace04Texture from '../assets/sprites/trace_04.png';
import trace05Texture from '../assets/sprites/trace_05.png';
import trace06Texture from '../assets/sprites/trace_06.png';
import trace07Texture from '../assets/sprites/trace_07.png';

// Twirl sprites
import twirl01Texture from '../assets/sprites/twirl_01.png';
import twirl02Texture from '../assets/sprites/twirl_02.png';
import twirl03Texture from '../assets/sprites/twirl_03.png';

// Window sprites
import window01Texture from '../assets/sprites/window_01.png';
import window02Texture from '../assets/sprites/window_02.png';
import window03Texture from '../assets/sprites/window_03.png';
import window04Texture from '../assets/sprites/window_04.png';

// Rotated sprites
import flame05RotatedTexture from '../assets/sprites/Rotated/flame_05_rotated.png';
import flame06RotatedTexture from '../assets/sprites/Rotated/flame_06_rotated.png';
import muzzle01RotatedTexture from '../assets/sprites/Rotated/muzzle_01_rotated.png';
import muzzle02RotatedTexture from '../assets/sprites/Rotated/muzzle_02_rotated.png';
import muzzle03RotatedTexture from '../assets/sprites/Rotated/muzzle_03_rotated.png';
import muzzle04RotatedTexture from '../assets/sprites/Rotated/muzzle_04_rotated.png';
import muzzle05RotatedTexture from '../assets/sprites/Rotated/muzzle_05_rotated.png';
import spark05RotatedTexture from '../assets/sprites/Rotated/spark_05_rotated.png';
import spark06RotatedTexture from '../assets/sprites/Rotated/spark_06_rotated.png';
import trace01RotatedTexture from '../assets/sprites/Rotated/trace_01_rotated.png';
import trace02RotatedTexture from '../assets/sprites/Rotated/trace_02_rotated.png';
import trace03RotatedTexture from '../assets/sprites/Rotated/trace_03_rotated.png';
import trace04RotatedTexture from '../assets/sprites/Rotated/trace_04_rotated.png';
import trace05RotatedTexture from '../assets/sprites/Rotated/trace_05_rotated.png';
import trace06RotatedTexture from '../assets/sprites/Rotated/trace_06_rotated.png';
import trace07RotatedTexture from '../assets/sprites/Rotated/trace_07_rotated.png';

// Default settings object - Enhanced with gravity, removed sprite properties
export const DEFAULT_VFX_SETTINGS = {
  // Transform
  positionX: 0, positionY: 0, positionZ: 0,
  rotationX: 0, rotationY: 0, rotationZ: 0,
  scaleX: 1, scaleY: 1, scaleZ: 1,
  
  // Basic properties
  particleCount: 800,
  animationDuration: 3.0,
  particleSize: 0.1,
  spreadRadius: 2,
  
  // Colors & effects
  color: '#ff6030',
  colorEnd: '#ff0030',
  useGradient: false,
  opacity: 1.0,
  blendMode: THREE.AdditiveBlending,
  
  // Shape & pattern
  shape: 'explosion',
  shapeHeight: 2.0,
  shapeAngle: 0,
  heightMultiplier: 1.0,
  sizeVariation: 0.5,
  timeVariation: 0.4,
  
  // Physics & forces - Enhanced with gravity
  directionalForceX: 0,
  directionalForceY: 0,
  directionalForceZ: 0,
  gravity: 0, // NEW: Gravity force
  turbulence: 0,
  streakLength: 0,
  
  // Animation & texture
  animationPreset: 'none',
  particleTexture: 'Circle', // ✅ UPDATED: Now handles both basic and extended textures
  motionBlur: false,
  
  // ✅ REMOVED: Sprite-specific properties (no longer needed)
  // useSprite: false,
  // spriteTexture: 'Circle 01',
  // spriteCategory: 'circle',
  
  // Helper settings
  showHelpers: false,
  helperOpacity: 0.3,
  fileName: 'my-vfx-settings'
};

/**
 * useVfxSettings - Manages VFX settings state with validation and updates
 * Enhanced with gravity support
 * 
 * @param {Object} initialSettings - Initial settings object
 * @param {Function} onSettingsChange - Callback when settings change
 * @returns {Object} - { settings, updateSettings, resetSettings, validateSettings }
 */
export const useVfxSettings = (initialSettings = {}, onSettingsChange) => {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_VFX_SETTINGS,
    ...initialSettings
  }));

  const updateSettings = (newSettings) => {
    console.log('🔧 useVfxSettings: updateSettings called with:', newSettings);
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      console.log('🔧 useVfxSettings: Updated settings state:', {
        prev: prev,
        new: updated,
        specificValues: {
          opacity: updated.opacity,
          blendMode: updated.blendMode,
          particleCount: updated.particleCount,
          shape: updated.shape,
          gravity: updated.gravity // NEW: Log gravity changes
        }
      });
      onSettingsChange?.(updated, newSettings);
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_VFX_SETTINGS);
    onSettingsChange?.(DEFAULT_VFX_SETTINGS);
  };

  const validateSettings = (settingsToValidate = settings) => {
    const errors = [];
    
    // Validate numeric ranges
    if (settingsToValidate.particleCount < 1 || settingsToValidate.particleCount > 5000) {
      errors.push('particleCount must be between 1 and 5000');
    }
    
    if (settingsToValidate.opacity < 0 || settingsToValidate.opacity > 1) {
      errors.push('opacity must be between 0 and 1');
    }
    
    if (settingsToValidate.animationDuration < 0.1 || settingsToValidate.animationDuration > 10) {
      errors.push('animationDuration must be between 0.1 and 10 seconds');
    }
    
    // NEW: Validate gravity range
    if (typeof settingsToValidate.gravity === 'number') {
      if (settingsToValidate.gravity < -20 || settingsToValidate.gravity > 20) {
        errors.push('gravity must be between -20 and 20');
      }
    }
    
    // Validate color format
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(settingsToValidate.color)) {
      errors.push('color must be a valid hex color');
    }
    if (!colorRegex.test(settingsToValidate.colorEnd)) {
      errors.push('colorEnd must be a valid hex color');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    validateSettings
  };
};

/**
 * useVfxTextures - Manages particle texture loading and selection
 * (No changes needed for gravity)
 * 
 * @returns {Object} - { textures, textureOptions, getTextureByName, isLoading }
 */
export const useVfxTextures = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const textures = useMemo(() => {
    const textureFiles = [
      { name: 'Circle', path: circleTexture },
      { name: 'Heart', path: heartTexture },
      { name: 'Point', path: pointTexture },
      { name: 'Point Cross', path: pointcrossTexture },
      { name: 'Point Cross 2', path: pointcross2Texture },
      { name: 'Ring', path: ringTexture },
      { name: 'Star', path: starTexture },
      { name: 'Star 2', path: star2Texture }
    ];

    const loadedTextures = textureFiles.map((textureFile) => {
      const texture = new THREE.TextureLoader().load(
        textureFile.path,
        // onLoad
        () => {
          console.log(`✅ Loaded texture: ${textureFile.name}`);
        },
        // onProgress
        undefined,
        // onError
        (error) => {
          console.error(`❌ Failed to load texture: ${textureFile.name}`, error);
        }
      );
      
      texture.flipY = false;
      texture.name = textureFile.name;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      return texture;
    });

    setIsLoading(false);
    return loadedTextures;
  }, []);

  const textureOptions = useMemo(() => {
    return textures.reduce((acc, texture) => {
      acc[texture.name] = texture.name;
      return acc;
    }, {});
  }, [textures]);

  const getTextureByName = (name) => {
    const texture = textures.find(t => t.name === name);
    return texture || textures[0]; // Fallback to first texture
  };

  return {
    textures,
    textureOptions,
    getTextureByName,
    isLoading
  };
};

/**
 * useVfxAnimation - Manages animation state and frame loop logic
 * Enhanced with gravity-aware animation presets
 * 
 * @param {Object} settings - VFX settings object
 * @param {Object} refs - { meshRef, materialRef }
 * @param {Function} onComplete - Callback when animation completes
 * @returns {Object} - { isPlaying, play, stop, progress, elapsedTime }
 */
export const useVfxAnimation = (settings, refs, onComplete) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(0);

  const play = () => {
    setIsPlaying(true);
    setProgress(0);
    startTimeRef.current = performance.now() / 1000;
  };

  const stop = () => {
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
  };

  const reset = () => {
    stop();
    if (refs.meshRef?.current) {
      const mesh = refs.meshRef.current;
      mesh.rotation.set(
        settings.rotationX * Math.PI / 180,
        settings.rotationY * Math.PI / 180,
        settings.rotationZ * Math.PI / 180
      );
      mesh.position.set(settings.positionX, settings.positionY, settings.positionZ);
      mesh.scale.set(settings.scaleX, settings.scaleY, settings.scaleZ);
    }
  };

  // Handle animation presets - Enhanced with gravity consideration
  const applyAnimationPreset = (presetProgress, mesh) => {
    if (!mesh || settings.animationPreset === 'none') return;
    
    const presetProgressRadians = presetProgress * Math.PI * 2;
    
    switch (settings.animationPreset) {
      case 'orbital':
        mesh.rotation.y = presetProgressRadians;
        break;
        
      case 'wave':
        let waveY = settings.positionY + Math.sin(presetProgressRadians * 2) * 0.5;
        // NEW: Apply gravity to wave motion
        if (settings.gravity !== 0) {
          waveY += settings.gravity * progress * progress * 0.1;
        }
        mesh.position.y = waveY;
        break;
        
      case 'spiral':
        mesh.rotation.y = presetProgressRadians;
        let spiralY = settings.positionY + progress * 2;
        // NEW: Apply gravity to spiral motion
        if (settings.gravity !== 0) {
          spiralY += settings.gravity * progress * progress * 0.1;
        }
        mesh.position.y = spiralY;
        break;
        
      case 'bounce':
        let bounce = Math.abs(Math.sin(presetProgressRadians * 4));
        // NEW: Gravity affects bounce behavior
        if (settings.gravity > 0) {
          // Upward gravity enhances bounce
          bounce *= (1 + settings.gravity * 0.1);
        } else if (settings.gravity < 0) {
          // Downward gravity dampens bounce
          bounce *= Math.max(0.1, 1 + settings.gravity * 0.1);
        }
        mesh.position.y = settings.positionY + bounce * 1.5;
        break;
        
      case 'shockwave':
        const shockScale = 1 + progress * 3;
        mesh.scale.set(shockScale, 1, shockScale);
        break;
    }
  };

  // Animation frame loop
  useFrame((state) => {
    if (!isPlaying || !refs.materialRef?.current) return;

    const currentTime = state.clock.elapsedTime;
    const animationTime = currentTime - (startTimeRef.current - performance.now() / 1000 + state.clock.elapsedTime);
    const currentProgress = Math.min(animationTime / settings.animationDuration, 1);

    setProgress(currentProgress);
    setElapsedTime(currentTime);

    // Update material uniforms
    const material = refs.materialRef.current;
    material.uProgress = currentProgress;
    material.uTime = currentTime;
    
    // NEW: Update gravity uniform
    if (material.uGravity !== undefined) {
      material.uGravity = settings.gravity;
    }

    // Apply animation presets (now gravity-aware)
    if (refs.meshRef?.current) {
      applyAnimationPreset(currentProgress, refs.meshRef.current);
    }

    // Check for completion
    if (currentProgress >= 1) {
      setIsPlaying(false);
      reset();
      onComplete?.();
    }
  });

  return {
    isPlaying,
    play,
    stop,
    reset,
    progress,
    elapsedTime
  };
};

/**
 * useVfxGeometry - Manages geometry generation and updates
 * (No changes needed for gravity - handled in shaders)
 * 
 * @param {Object} settings - VFX settings object
 * @param {Function} shapeGenerator - Function to generate positions
 * @returns {THREE.BufferGeometry} - Generated geometry
 */
export const useVfxGeometry = (settings, shapeGenerator) => {
  const geometry = useMemo(() => {
    console.log('🔄 Regenerating geometry with settings:', {
      shape: settings.shape,
      particleCount: settings.particleCount,
      spreadRadius: settings.spreadRadius,
      particleSize: settings.particleSize,
      gravity: settings.gravity // NEW: Log gravity in geometry generation
    });
    
    if (!shapeGenerator) {
      console.warn('No shape generator provided to useVfxGeometry');
      return new THREE.BufferGeometry();
    }

    const positionsArray = shapeGenerator(
      settings.shape,
      settings.particleCount,
      settings.spreadRadius,
      settings.shapeHeight,
      settings.shapeAngle,
      settings.heightMultiplier
    );

    const sizesArray = new Float32Array(settings.particleCount);
    const timeMultipliersArray = new Float32Array(settings.particleCount);
    
    for (let i = 0; i < settings.particleCount; i++) {
      sizesArray[i] = Math.random() * settings.sizeVariation + (1 - settings.sizeVariation);
      timeMultipliersArray[i] = 1 + Math.random() * settings.timeVariation;
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizesArray, 1));
    geo.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliersArray, 1));
    
    return geo;
  }, [
    settings.shape,
    settings.particleCount,
    settings.spreadRadius,
    settings.shapeHeight,
    settings.shapeAngle,
    settings.heightMultiplier,
    settings.sizeVariation,
    settings.timeVariation,
    shapeGenerator
  ]);

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [geometry]);

  return geometry;
};

/**
 * useVfxMaterial - Manages material uniforms and updates
 * ✅ UPDATED: Simplified to handle auto-detect texture selection
 * 
 * @param {Object} settings - VFX settings object
 * @param {Array} textures - Available particle textures array
 * @param {Array} sprites - Available sprite textures array (optional)
 * @param {Object} canvasSize - Canvas size from useThree
 * @returns {Object} - { materialRef, updateMaterial }
 */
export const useVfxMaterial = (settings, textures, canvasSize, sprites = []) => {
  const materialRef = useRef();

  const updateMaterial = () => {
    if (!materialRef.current) return;

    const material = materialRef.current;
    
    // Basic uniforms
    material.uSize = settings.particleSize;
    material.uResolution.set(
      canvasSize.width * Math.min(window.devicePixelRatio, 2),
      canvasSize.height * Math.min(window.devicePixelRatio, 2)
    );
    
    // Color uniforms
    material.uColor = new THREE.Color(settings.color);
    material.uColorEnd = new THREE.Color(settings.colorEnd);
    material.uUseGradient = settings.useGradient ? 1.0 : 0.0;
    
    // Physics uniforms - Enhanced with gravity
    material.uStreakLength = settings.streakLength;
    material.uTurbulence = settings.turbulence;
    material.uDirectionalForce = new THREE.Vector3(
      settings.directionalForceX,
      settings.directionalForceY,
      settings.directionalForceZ
    );
    
    // Gravity uniform
    material.uGravity = settings.gravity;
    
    // Motion blur
    material.uMotionBlur = settings.motionBlur ? 1.0 : 0.0;
    
    // ✅ UPDATED: Auto-detect texture type
    const selectedTextureName = settings.particleTexture || 'Circle';
    
    // First, try to find in extended textures (sprites)
    if (sprites && sprites.length > 0) {
      const sprite = sprites.find(s => s.name === selectedTextureName);
      if (sprite) {
        material.uTexture = sprite;
        console.log('🖼️ Material using extended texture:', sprite.name);
        return;
      }
    }
    
    // If not found in sprites, look in basic particle textures
    if (textures.length > 0) {
      const texture = textures.find(t => t.name === selectedTextureName);
      if (texture) {
        material.uTexture = texture;
        console.log('🔹 Material using basic texture:', texture.name);
      } else {
        // Fallback to first available texture
        material.uTexture = textures[0];
        console.log('⚠️ Material texture not found, using fallback:', textures[0].name);
      }
    }
    
    console.log('🔄 Updated material uniforms:', {
      gravity: settings.gravity,
      directionalForce: [settings.directionalForceX, settings.directionalForceY, settings.directionalForceZ],
      turbulence: settings.turbulence,
      selectedTexture: selectedTextureName
    });
  };

  // Update material when settings change
  useEffect(() => {
    updateMaterial();
  }, [settings, textures, sprites, canvasSize]);

  return {
    materialRef,
    updateMaterial
  };
};

/**
 * useVfxTrigger - Manages VFX triggering and external activation
 * (No changes needed for gravity)
 * 
 * @param {Function} playFunction - Function to call when triggered
 * @param {boolean} isActive - External active state
 * @param {boolean} trigger - Trigger flag from settings
 * @returns {Object} - { triggerEffect, isTriggered }
 */
export const useVfxTrigger = (playFunction, isActive, trigger) => {
  const [isTriggered, setIsTriggered] = useState(false);
  const prevTriggerRef = useRef(trigger);
  const prevActiveRef = useRef(isActive);

  const triggerEffect = () => {
    playFunction?.();
    setIsTriggered(true);
    setTimeout(() => setIsTriggered(false), 100); // Brief flash
  };

  // Handle isActive prop changes
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      triggerEffect();
    }
    prevActiveRef.current = isActive;
  }, [isActive, playFunction]);

  // Handle trigger setting changes
  useEffect(() => {
    if (trigger && !prevTriggerRef.current) {
      triggerEffect();
    }
    prevTriggerRef.current = trigger;
  }, [trigger, playFunction]);

  return {
    triggerEffect,
    isTriggered
  };
};

/**
 * useVfxSprites - Manages sprite texture loading and selection
 * Organizes sprites by category for easy selection
 * 
 * @returns {Object} - { sprites, spriteOptions, getSpriteByName, spriteCategories, getCategorySprites, isLoading }
 */
export const useVfxSprites = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const sprites = useMemo(() => {
    // Define sprite categories and files
    const spriteFiles = [
      // Circle sprites
      { name: 'Circle 01', path: circle01Texture, category: 'circle' },
      { name: 'Circle 02', path: circle02Texture, category: 'circle' },
      { name: 'Circle 03', path: circle03Texture, category: 'circle' },
      { name: 'Circle 04', path: circle04Texture, category: 'circle' },
      { name: 'Circle 05', path: circle05Texture, category: 'circle' },
      
      // Dirt sprites
      { name: 'Dirt 01', path: dirt01Texture, category: 'dirt' },
      { name: 'Dirt 02', path: dirt02Texture, category: 'dirt' },
      { name: 'Dirt 03', path: dirt03Texture, category: 'dirt' },
      
      // Fire sprites
      { name: 'Fire 01', path: fire01Texture, category: 'fire' },
      { name: 'Fire 02', path: fire02Texture, category: 'fire' },
      
      // Flame sprites
      { name: 'Flame 01', path: flame01Texture, category: 'flame' },
      { name: 'Flame 02', path: flame02Texture, category: 'flame' },
      { name: 'Flame 03', path: flame03Texture, category: 'flame' },
      { name: 'Flame 04', path: flame04Texture, category: 'flame' },
      { name: 'Flame 05', path: flame05Texture, category: 'flame' },
      { name: 'Flame 06', path: flame06Texture, category: 'flame' },
      { name: 'Flame 05 (Rotated)', path: flame05RotatedTexture, category: 'flame' },
      { name: 'Flame 06 (Rotated)', path: flame06RotatedTexture, category: 'flame' },
      
      // Flare sprite
      { name: 'Flare 01', path: flare01Texture, category: 'flare' },
      
      // Light sprites
      { name: 'Light 01', path: light01Texture, category: 'light' },
      { name: 'Light 02', path: light02Texture, category: 'light' },
      { name: 'Light 03', path: light03Texture, category: 'light' },
      
      // Magic sprites
      { name: 'Magic 01', path: magic01Texture, category: 'magic' },
      { name: 'Magic 02', path: magic02Texture, category: 'magic' },
      { name: 'Magic 03', path: magic03Texture, category: 'magic' },
      { name: 'Magic 04', path: magic04Texture, category: 'magic' },
      { name: 'Magic 05', path: magic05Texture, category: 'magic' },
      
      // Muzzle sprites
      { name: 'Muzzle 01', path: muzzle01Texture, category: 'muzzle' },
      { name: 'Muzzle 02', path: muzzle02Texture, category: 'muzzle' },
      { name: 'Muzzle 03', path: muzzle03Texture, category: 'muzzle' },
      { name: 'Muzzle 04', path: muzzle04Texture, category: 'muzzle' },
      { name: 'Muzzle 05', path: muzzle05Texture, category: 'muzzle' },
      { name: 'Muzzle 01 (Rotated)', path: muzzle01RotatedTexture, category: 'muzzle' },
      { name: 'Muzzle 02 (Rotated)', path: muzzle02RotatedTexture, category: 'muzzle' },
      { name: 'Muzzle 03 (Rotated)', path: muzzle03RotatedTexture, category: 'muzzle' },
      { name: 'Muzzle 04 (Rotated)', path: muzzle04RotatedTexture, category: 'muzzle' },
      { name: 'Muzzle 05 (Rotated)', path: muzzle05RotatedTexture, category: 'muzzle' },
      
      // Scorch sprites
      { name: 'Scorch 01', path: scorch01Texture, category: 'scorch' },
      { name: 'Scorch 02', path: scorch02Texture, category: 'scorch' },
      { name: 'Scorch 03', path: scorch03Texture, category: 'scorch' },
      
      // Scratch sprite
      { name: 'Scratch 01', path: scratch01Texture, category: 'scratch' },
      
      // Slash sprites
      { name: 'Slash 01', path: slash01Texture, category: 'slash' },
      { name: 'Slash 02', path: slash02Texture, category: 'slash' },
      { name: 'Slash 03', path: slash03Texture, category: 'slash' },
      { name: 'Slash 04', path: slash04Texture, category: 'slash' },
      
      // Smoke sprites
      { name: 'Smoke 01', path: smoke01Texture, category: 'smoke' },
      { name: 'Smoke 02', path: smoke02Texture, category: 'smoke' },
      { name: 'Smoke 03', path: smoke03Texture, category: 'smoke' },
      { name: 'Smoke 04', path: smoke04Texture, category: 'smoke' },
      { name: 'Smoke 05', path: smoke05Texture, category: 'smoke' },
      { name: 'Smoke 06', path: smoke06Texture, category: 'smoke' },
      { name: 'Smoke 07', path: smoke07Texture, category: 'smoke' },
      { name: 'Smoke 08', path: smoke08Texture, category: 'smoke' },
      { name: 'Smoke 09', path: smoke09Texture, category: 'smoke' },
      { name: 'Smoke 10', path: smoke10Texture, category: 'smoke' },
      
      // Spark sprites
      { name: 'Spark 01', path: spark01Texture, category: 'spark' },
      { name: 'Spark 02', path: spark02Texture, category: 'spark' },
      { name: 'Spark 03', path: spark03Texture, category: 'spark' },
      { name: 'Spark 04', path: spark04Texture, category: 'spark' },
      { name: 'Spark 05', path: spark05Texture, category: 'spark' },
      { name: 'Spark 06', path: spark06Texture, category: 'spark' },
      { name: 'Spark 07', path: spark07Texture, category: 'spark' },
      { name: 'Spark 05 (Rotated)', path: spark05RotatedTexture, category: 'spark' },
      { name: 'Spark 06 (Rotated)', path: spark06RotatedTexture, category: 'spark' },
      
      // Star sprites
      { name: 'Star 01', path: star01Texture, category: 'star' },
      { name: 'Star 02', path: star02Texture, category: 'star' },
      { name: 'Star 03', path: star03Texture, category: 'star' },
      { name: 'Star 04', path: star04Texture, category: 'star' },
      { name: 'Star 05', path: star05Texture, category: 'star' },
      { name: 'Star 06', path: star06Texture, category: 'star' },
      { name: 'Star 07', path: star07Texture, category: 'star' },
      { name: 'Star 08', path: star08Texture, category: 'star' },
      { name: 'Star 09', path: star09Texture, category: 'star' },
      
      // Symbol sprites
      { name: 'Symbol 01', path: symbol01Texture, category: 'symbol' },
      { name: 'Symbol 02', path: symbol02Texture, category: 'symbol' },
      
      // Trace sprites
      { name: 'Trace 01', path: trace01Texture, category: 'trace' },
      { name: 'Trace 02', path: trace02Texture, category: 'trace' },
      { name: 'Trace 03', path: trace03Texture, category: 'trace' },
      { name: 'Trace 04', path: trace04Texture, category: 'trace' },
      { name: 'Trace 05', path: trace05Texture, category: 'trace' },
      { name: 'Trace 06', path: trace06Texture, category: 'trace' },
      { name: 'Trace 07', path: trace07Texture, category: 'trace' },
      { name: 'Trace 01 (Rotated)', path: trace01RotatedTexture, category: 'trace' },
      { name: 'Trace 02 (Rotated)', path: trace02RotatedTexture, category: 'trace' },
      { name: 'Trace 03 (Rotated)', path: trace03RotatedTexture, category: 'trace' },
      { name: 'Trace 04 (Rotated)', path: trace04RotatedTexture, category: 'trace' },
      { name: 'Trace 05 (Rotated)', path: trace05RotatedTexture, category: 'trace' },
      { name: 'Trace 06 (Rotated)', path: trace06RotatedTexture, category: 'trace' },
      { name: 'Trace 07 (Rotated)', path: trace07RotatedTexture, category: 'trace' },
      
      // Twirl sprites
      { name: 'Twirl 01', path: twirl01Texture, category: 'twirl' },
      { name: 'Twirl 02', path: twirl02Texture, category: 'twirl' },
      { name: 'Twirl 03', path: twirl03Texture, category: 'twirl' },
      
      // Window sprites
      { name: 'Window 01', path: window01Texture, category: 'window' },
      { name: 'Window 02', path: window02Texture, category: 'window' },
      { name: 'Window 03', path: window03Texture, category: 'window' },
      { name: 'Window 04', path: window04Texture, category: 'window' },
    ];

    // Load all textures
    const loadedSprites = spriteFiles.map((spriteFile) => {
      const texture = new THREE.TextureLoader().load(
        spriteFile.path,
        // onLoad
        () => {
          console.log(`✅ Loaded sprite: ${spriteFile.name}`);
        },
        // onProgress
        undefined,
        // onError
        (error) => {
          console.error(`❌ Failed to load sprite: ${spriteFile.name}`, error);
        }
      );
      
      texture.flipY = false;
      texture.name = spriteFile.name;
      texture.category = spriteFile.category;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      return texture;
    });

    setIsLoading(false);
    return loadedSprites;
  }, []);

  // Create options object for selection UI
  const spriteOptions = useMemo(() => {
    return sprites.reduce((acc, sprite) => {
      acc[sprite.name] = sprite.name;
      return acc;
    }, {});
  }, [sprites]);

  // Generate categories for filtering
  const spriteCategories = useMemo(() => {
    const categories = [...new Set(sprites.map(sprite => sprite.category))];
    return categories.sort();
  }, [sprites]);

  // Function to get sprite by name
  const getSpriteByName = (name) => {
    const sprite = sprites.find(s => s.name === name);
    return sprite || sprites[0]; // Fallback to first sprite
  };

  // Function to get sprites by category
  const getCategorySprites = (category) => {
    return sprites.filter(sprite => sprite.category === category);
  };

  return {
    sprites,
    spriteOptions,
    getSpriteByName,
    spriteCategories,
    getCategorySprites,
    isLoading
  };
};

/**
 * NEW: useGravityEffects - Specialized hook for gravity-based effects
 * Provides presets and utilities for common gravity scenarios
 * 
 * @param {Function} updateSettings - Function to update VFX settings
 * @returns {Object} - { applyEarthGravity, applyMoonGravity, applyZeroGravity, applyReverseGravity, getGravityPresets }
 */
export const useGravityEffects = (updateSettings) => {
  const gravityPresets = {
    earth: { gravity: -9.8, name: 'Earth Gravity' },
    moon: { gravity: -1.6, name: 'Moon Gravity' },
    mars: { gravity: -3.7, name: 'Mars Gravity' },
    jupiter: { gravity: -24.8, name: 'Jupiter Gravity' },
    zero: { gravity: 0, name: 'Zero Gravity' },
    reverse: { gravity: 5, name: 'Reverse Gravity' },
    heavy: { gravity: -15, name: 'Heavy Gravity' },
    light: { gravity: -2, name: 'Light Gravity' },
    floaty: { gravity: 2, name: 'Floaty/Helium' },
    extreme: { gravity: -20, name: 'Extreme Gravity' }
  };

  const applyGravityPreset = (presetKey) => {
    const preset = gravityPresets[presetKey];
    if (preset && updateSettings) {
      console.log(`🌍 Applying ${preset.name}: ${preset.gravity}`);
      updateSettings({ gravity: preset.gravity });
      return true;
    }
    return false;
  };

  const applyEarthGravity = () => applyGravityPreset('earth');
  const applyMoonGravity = () => applyGravityPreset('moon');
  const applyMarsGravity = () => applyGravityPreset('mars');
  const applyZeroGravity = () => applyGravityPreset('zero');
  const applyReverseGravity = () => applyGravityPreset('reverse');
  const applyHeavyGravity = () => applyGravityPreset('heavy');

  const getGravityPresets = () => gravityPresets;

  const createGravitySequence = (sequence, intervalMs = 2000) => {
    let currentIndex = 0;
    
    const applyNext = () => {
      if (currentIndex < sequence.length) {
        const preset = sequence[currentIndex];
        applyGravityPreset(preset);
        currentIndex++;
        
        if (currentIndex < sequence.length) {
          setTimeout(applyNext, intervalMs);
        }
      }
    };
    
    applyNext();
  };

  return {
    applyEarthGravity,
    applyMoonGravity,
    applyMarsGravity,
    applyZeroGravity,
    applyReverseGravity,
    applyHeavyGravity,
    applyGravityPreset,
    getGravityPresets,
    createGravitySequence,
    gravityPresets
  };
};