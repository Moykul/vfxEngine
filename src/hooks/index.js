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

// Default settings object - Enhanced with gravity
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
  particleTexture: 'Circle',
  motionBlur: false,
  
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
 * Enhanced with gravity uniform support
 * 
 * @param {Object} settings - VFX settings object
 * @param {Array} textures - Available textures array
 * @param {Object} canvasSize - Canvas size from useThree
 * @returns {Object} - { materialRef, updateMaterial }
 */
export const useVfxMaterial = (settings, textures, canvasSize) => {
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
    
    // NEW: Gravity uniform
    material.uGravity = settings.gravity;
    
    // Motion blur
    material.uMotionBlur = settings.motionBlur ? 1.0 : 0.0;
    
    // Texture selection
    if (textures.length > 0) {
      const textureIndex = textures.findIndex(texture => texture.name === settings.particleTexture);
      const clampedTextureIndex = textureIndex >= 0 ? textureIndex : 0;
      material.uTexture = textures[clampedTextureIndex];
    }
    
    console.log('🔄 Updated material uniforms with gravity:', {
      gravity: settings.gravity,
      directionalForce: [settings.directionalForceX, settings.directionalForceY, settings.directionalForceZ],
      turbulence: settings.turbulence
    });
  };

  // Update material when settings change - Enhanced dependencies
  useEffect(() => {
    updateMaterial();
  }, [settings, textures, canvasSize]); // gravity is included in settings

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