import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useControls, button, folder } from 'leva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import VfxEngine from './VfxEngine.jsx';
import fileManager from '../timeline/fileManager';
import { getVfxValues } from './VfxParameters.js';
import { useVfxSettings } from '../../contexts/VfxSettingsContext.jsx';
import { useVfxSprites } from '../../hooks/index.js';
import { useVfxSpritesheets } from '../../hooks/useVfxSpritesheets.js';
import VFX_PRESETS, { getPreset, listPresets } from './vfxPresets.js';

// Debug flag for real-time updates
const DEBUG = false;

const VfxLevaControls = () => {
  const { vfxSettings, updateVfxSettings } = useVfxSettings();
  // ✅ FIXED: Initialize with context settings, but safely
  const [vfxValues, setVfxValues] = useState(() => {
    // Ensure we have valid settings, fall back to defaults if needed
    return Object.keys(vfxSettings || {}).length > 0 ? vfxSettings : getVfxValues();
  });
  
  const fileInputRef = useRef();

  // ✅ HELPER: Get value from context with fallback to defaults
  const getConfigValue = useCallback((key, defaultValue) => {
    if (!vfxSettings || typeof vfxSettings !== 'object') {
      return getVfxValues()[key] !== undefined ? getVfxValues()[key] : defaultValue;
    }
    return vfxSettings[key] !== undefined ? vfxSettings[key] : 
           (getVfxValues()[key] !== undefined ? getVfxValues()[key] : defaultValue);
  }, [vfxSettings]);

  
  // Load all available textures and spritesheets
  const { sprites, spriteCategories } = useVfxSprites();
  const { spritesheets, spritesheetOptions, animationModeOptions, getSpritesheetMetadata } = useVfxSpritesheets();

  // ✅ ENHANCED: Combined texture options (basic + extended)
  const allTextureOptions = useMemo(() => {
    const options = {};
    
    // Add basic particle textures first
    options['-- BASIC PARTICLES --'] = '';
    const basicTextures = { 
      'Circle': 'Circle', 
      'Heart': 'Heart', 
      'Point': 'Point', 
      'Point Cross': 'Point Cross', 
      'Point Cross 2': 'Point Cross 2', 
      'Ring': 'Ring', 
      'Star': 'Star', 
      'Star 2': 'Star 2' 
    };
    Object.assign(options, basicTextures);
    
    // Add extended textures by category
    spriteCategories.forEach(category => {
      options[`-- ${category.toUpperCase()} --`] = '';
      sprites
        .filter(sprite => sprite.category === category)
        .forEach(sprite => {
          options[sprite.name] = sprite.name;
        });
    });
    
    return options;
  }, [sprites, spriteCategories]);

  // ✅ ENHANCED: Create config object with new spritesheet section
  const levaConfig = useMemo(() => ({
    // === PARTICLES ===
    'Particles': folder({
      pCount: { value: vfxSettings.pCount || 800, min: 1, max: 4000, step: 10 },
      duration: { value: vfxSettings.duration || 3.0, min: 0.5, max: 10.0, step: 0.1 },
      pSize: { 
        value: vfxSettings.pSize || 0.4, 
        min: 0.01, 
        max: 1.0, 
        step: 0.01,
        label: 'Particle Size (real-time)'
      },
      spread: { value: vfxSettings.spread || 2, min: 0.5, max: 10, step: 0.1 },
      pAge: { value: vfxSettings.pAge || 1.0, min: 0.1, max: 3.0, step: 0.1 },
      sizeVariation: { value: vfxSettings.sizeVariation || 0.5, min: 0.0, max: 1.0, step: 0.1 },
      timeVariation: { value: getConfigValue('timeVariation', 0.4), min: 0.0, max: 1.0, step: 0.1 }
    }),

    // === COLORS & EFFECTS ===
    'Colors & Effects': folder({
      color: { value: getConfigValue('color', '#ff6030') },
      colorEnd: { value: getConfigValue('colorEnd', '#ff0030') },
      useGradient: { value: getConfigValue('useGradient', false) },
      opacity: { value: vfxValues.opacity, min: 0.0, max: 1.0, step: 0.1 },
      blendMode: { 
        value: vfxValues.blendMode,
        options: { 'Additive': 0, 'Normal': 1, 'Multiply': 2, 'Subtractive': 3 }
      }
    }),

    // === PHYSICS ===
    'Physics': folder({
      gravity: { value: vfxValues.gravity, min: -15.0, max: 15.0, step: 0.1 },
      turbulence: { value: vfxValues.turbulence, min: 0.0, max: 5.0, step: 0.1 },
      directionalForceX: { value: vfxValues.directionalForceX, min: -10.0, max: 10.0, step: 0.1 },
      directionalForceY: { value: vfxValues.directionalForceY, min: -10.0, max: 10.0, step: 0.1 },
      directionalForceZ: { value: vfxValues.directionalForceZ, min: -10.0, max: 10.0, step: 0.1 },
      streakLength: { value: vfxValues.streakLength, min: 0.0, max: 2.0, step: 0.1 }
    }),

    // === SHAPE & TEXTURE ===
    'Shape & Texture': folder({
          shape: {
            value: vfxValues.shape,
            options: ['explosion', 'sphere', 'box', 'cone', 'circle', 'square', 'spiral', 'wave', 'glb', 'model', 'tornado']
          },
          shapeHeight: { value: vfxValues.shapeHeight, min: 0.5, max: 10.0, step: 0.1 },
          shapeAngle: { value: vfxValues.shapeAngle, min: 0, max: 360, step: 1 },
          heightMultiplier: { value: vfxValues.heightMultiplier, min: 0.1, max: 5.0, step: 0.1 },
          animationPreset: {
            value: vfxValues.animationPreset,
            options: ['none', 'fadeIn', 'fadeOut', 'spiral', 'burst', 'gravity']
          },
          // ✅ UPDATED: Combined texture selection
          particleTexture: {
            value: vfxValues.particleTexture || 'Circle',
            options: allTextureOptions,
            label: 'Texture (Basic + Extended)'
          },
          motionBlur: { value: vfxValues.motionBlur }
        }),

    // === TRAILS ===
    'Trails': folder({
      trailEnabled: { value: getVfxValues().trailEnabled || false, label: 'Enable Trails' },
      trailLength: { value: getVfxValues().trailLength || 4, min: 1, max: 16, step: 1, label: 'Trail Samples' },
  trailDamping: { value: getVfxValues().trailDamping || 1.2, min: 0.1, max: 3.0, step: 0.1, label: 'Trail Damping' },
  trailSize: { value: getVfxValues().trailSize || 0.02, min: 0.0, max: 0.2, step: 0.005, label: 'Trail Size' }
    }),

    // === NEW: ANIMATED TEXTURES (SPRITESHEETS) ===
    'Animated Textures': folder({
      useSpritesheet: { 
        value: getVfxValues().useSpritesheet || false,
        label: '🎬 Use Animated Spritesheet'
      },
      spritesheetName: {
        value: getVfxValues().spritesheetName || 'pow_explosion_5x5',
        options: spritesheetOptions,
        label: 'Spritesheet',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      },
      spritesheetFrameRate: {
        value: getVfxValues().spritesheetFrameRate || 24,
        min: 1,
        max: 60,
        step: 1,
        label: 'Frame Rate (fps)',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      },
      spritesheetAnimationMode: {
        value: getVfxValues().spritesheetAnimationMode || 'once',
        options: animationModeOptions,
        label: 'Animation Mode',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      },
      spritesheetRandomStart: {
        value: getVfxValues().spritesheetRandomStart || false,
        label: 'Random Start Frames',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      }
    }),

    // === TORNADO CONTROLS ===
    'Tornado': folder({
      tornadoEnabled: { 
        value: getVfxValues().tornadoEnabled,
        label: '🌪️ Enable Tornado'
      },
      tornadoHeight: { 
        value: getVfxValues().tornadoHeight, 
        min: 1, max: 20, step: 0.1,
        label: 'Height'
      },
      baseDiameter: { 
        value: getVfxValues().baseDiameter, 
        min: 0.1, max: 3, step: 0.1,
        label: 'Base Width'
      },
      topDiameter: { 
        value: getVfxValues().topDiameter, 
        min: 0.1, max: 8, step: 0.1,
        label: 'Top Width'
      },
      verticalSpeed: { 
        value: getVfxValues().verticalSpeed, 
        min: 0, max: 5, step: 0.1,
        label: 'Vertical Speed'
      },
      rotationSpeed: { 
        value: getVfxValues().rotationSpeed, 
        min: 0, max: 36, step: 3,
        label: 'Rotation Speed'
      },
      vortexStrength: { 
        value: getVfxValues().vortexStrength, 
        min: 0, max: 5, step: 0.1,
        label: 'Vortex Strength'
      },
      spiralSpin: { 
        value: getVfxValues().spiralSpin, 
        min: -10, max: 10, step: 0.1,
        label: 'Spiral Intensity'
      },
      heightColorGradient: { 
        value: getVfxValues().heightColorGradient,
        label: 'Height Color Gradient'
      }
    })
  }), [vfxSettings, allTextureOptions, spritesheetOptions, animationModeOptions, getConfigValue]);

  const [allVfxControls, setAllVfxControls] = useControls('VFX Controls', () => levaConfig);

  // ✅ SYNC: When shared context changes (from other modes), update local state
  useEffect(() => {
    if (vfxSettings && typeof vfxSettings === 'object' && Object.keys(vfxSettings).length > 0) {
      setVfxValues(vfxSettings);
    }
  }, [vfxSettings]);

  // ✅ INIT: Initialize Leva controls with context values on mount
  useEffect(() => {
    // On initial mount, set Leva controls to match context
    if (!vfxSettings || typeof vfxSettings !== 'object') {
      console.log('🔄 VfxSettings not ready, skipping initialization');
      return;
    }
    
    const contextKeys = Object.keys(vfxSettings);
    if (contextKeys.length > 0) {
      console.log('🔄 Initializing Leva controls with context values');
      
      // Only set values that are safe for Leva controls
      const safeUpdates = {};
      contextKeys.forEach(key => {
        const value = vfxSettings[key];
        // Only include primitive values, not objects or functions
        if (value !== undefined && value !== null && 
            typeof value !== 'function' && typeof value !== 'object') {
          safeUpdates[key] = value;
        }
      });
      
      if (Object.keys(safeUpdates).length > 0) {
        try {
          setAllVfxControls(safeUpdates);
        } catch (error) {
          console.warn('🔄 Failed to initialize Leva controls:', error);
        }
      }
    }
  }, []); // Only run on mount

  // ✅ SYNC: Update Leva controls when context changes to match loaded settings
  useEffect(() => {
    if (!vfxSettings || typeof vfxSettings !== 'object') {
      return;
    }
    
    // Build updates object for Leva controls from context settings
    const levaUpdates = {};
    
    // Map context settings to Leva control structure - only safe values
    Object.keys(vfxSettings).forEach(key => {
      const value = vfxSettings[key];
      if (value !== undefined && value !== null && 
          typeof value !== 'function' && typeof value !== 'object') {
        levaUpdates[key] = value;
      }
    });
    
    if (Object.keys(levaUpdates).length > 0) {
      try {
        setAllVfxControls(levaUpdates);
      } catch (error) {
        console.warn('🔄 Failed to sync Leva controls:', error);
      }
    }
  }, [vfxSettings, setAllVfxControls]);

  // ✅ FORCE UPDATE: When spritesheetOptions becomes populated, force Leva to refresh
  useEffect(() => {
    const hasSpritesheetOptions = Object.keys(spritesheetOptions).length > 0;
    if (hasSpritesheetOptions) {
      console.log('🔄 Spritesheet options populated, forcing Leva update');
      // Force regeneration by updating the config - but safely
      try {
        // Don't pass empty object, instead trigger a re-render by updating with current values
        const currentValues = { ...allVfxControls };
        if (Object.keys(currentValues).length > 0) {
          setAllVfxControls(currentValues);
        }
      } catch (error) {
        console.warn('🔄 Failed to update spritesheet options:', error);
      }
    }
  }, [spritesheetOptions, allVfxControls, setAllVfxControls]);

  // ✅ ENHANCED: Local values for VfxEngine (includes spritesheet data)
  const allVfxValues = useMemo(() => ({
    // Default transform values (for VFX-only mode)
    positionX: vfxValues.positionX,
    positionY: vfxValues.positionY,
    positionZ: vfxValues.positionZ,
    rotationX: vfxValues.rotationX,
    rotationY: vfxValues.rotationY,
    rotationZ: vfxValues.rotationZ,
    scale: vfxValues.scale,
    // VFX effect parameters from live controls
    ...allVfxControls
  }), [allVfxControls, vfxValues]);

  // ✅ ENHANCED: VFX trigger for animation playback with mode detection
  const actionControls = useControls("🚀 Actions", {
    'Fire Current Settings!': button(() => {
      const mode = allVfxControls.useSpritesheet ? 'Spritesheet' : 
                   allVfxControls.tornadoEnabled ? 'Tornado' : 'Standard';
      console.log(`🚀 Firing VFX animation (${mode} mode)`);
      
      // Trigger animation playback with current settings
      setVfxValues({ ...allVfxValues, trigger: true });
      // Auto-reset trigger after brief moment
      setTimeout(() => {
        setVfxValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    }),
    'Debug Values': button(() => {
      console.log('🔍 Current VFX Values:', allVfxValues);
      console.log('🔍 Live VFX Controls:', allVfxControls);
      console.log('🔍 Parameters count:', Object.keys(allVfxValues).length);
      
      // Show spritesheet info if enabled
      if (allVfxControls.useSpritesheet) {
        const metadata = getSpritesheetMetadata(allVfxControls.spritesheetName);
        console.log('🎬 Spritesheet metadata:', metadata);
      }
    }),
    'Show Spritesheet Info': button(() => {
      if (allVfxControls.useSpritesheet) {
        const metadata = getSpritesheetMetadata(allVfxControls.spritesheetName);
        if (metadata) {
          alert(`🎬 Spritesheet: ${metadata.name}\n` +
                `Grid: ${metadata.framesX}x${metadata.framesY}\n` +
                `Total Frames: ${metadata.totalFrames}\n` +
                `Frame Rate: ${metadata.frameRate}fps\n` +
                `Mode: ${metadata.animationMode}\n` +
                `Category: ${metadata.category}\n` +
                `Description: ${metadata.description}`);
        }
      } else {
        alert('🔍 Enable spritesheet mode to view spritesheet information');
      }
    })
  });

  // ✅ ENHANCED: File operations with spritesheet support
  useControls('💾 File Operations', {
    'Save Settings': button(() => {
      const vfxData = {
        vfxSettings: vfxSettings  // ✅ FIXED: Use shared context instead of allVfxControls
      };
      
      fileManager.saveJSON(vfxData, 'vfx-settings.json');
      console.log('💾 VFX settings saved from shared context (including spritesheet settings)');
    }),
    'Load Settings': button(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    })
  });

  // ✅ FIXED: Only update shared context with VFX effect parameters (NO transforms)
  useEffect(() => {
    updateVfxSettings(allVfxControls);
  }, [allVfxControls, updateVfxSettings]);

  // ✅ PRESETS: Add a small controller to pick/apply presets
  const presetNames = useMemo(() => listPresets(), []);

  // Create Leva controls for selecting a preset and triggering it.
  // We'll watch the selected name with useEffect and apply changes there
  // instead of using an inline `onChange` handler inside the Leva schema.
  const [presetControls, setPresetControls] = useControls('🎛️ Presets', () => ({
    presetSelection: {
      value: presetNames[0] || '',
      options: presetNames
    },
    'Trigger Preset': button(() => {
      setVfxValues(prev => ({ ...prev, trigger: true }));
      setTimeout(() => setVfxValues(prev => ({ ...prev, trigger: false })), 120);
    })
  }));

  // Apply preset when selection changes
  useEffect(() => {
    const name = presetControls.presetSelection;
    if (!name) return;
    const preset = getPreset(name);
    if (preset) {
      console.log('🎛️ Applying preset (effect):', name);
      // Always update shared settings
      updateVfxSettings(preset);

      // Filter preset keys to only those that currently exist in Leva controls
      try {
        const currentKeys = Object.keys(allVfxControls || {});
        const filtered = Object.fromEntries(
          Object.entries(preset).filter(([k]) => currentKeys.includes(k))
        );

        const missing = Object.entries(preset).filter(([k]) => !currentKeys.includes(k)).map(([k]) => k);
        if (missing.length) console.warn('🎛️ Preset contains keys not in Leva controls, skipping:', missing);

        if (Object.keys(filtered).length) {
          setAllVfxControls(filtered);
        }
      } catch (err) {
        console.error('🎛️ Failed to apply preset to Leva controls:', err);
      }
    }
  }, [presetControls.presetSelection, updateVfxSettings, setAllVfxControls]);

  // ✅ ENHANCED: Debug effect for real-time updates with spritesheet info
  useEffect(() => {
    if (DEBUG) {
      console.log('🔄 Real-time VFX update:', {
        pSize: allVfxControls.pSize,
        pCount: allVfxControls.pCount,
        gravity: allVfxControls.gravity,
        color: allVfxControls.color,
        shape: allVfxControls.shape,
        useSpritesheet: allVfxControls.useSpritesheet,
        spritesheetName: allVfxControls.spritesheetName,
        timestamp: Date.now()
      });
    }
  }, [allVfxControls]);

  // ✅ REAL-TIME: Always use current control values for live updates
  const finalVfxValues = useMemo(() => {
    const baseValues = { ...allVfxValues };
    if (Object.keys(vfxValues).length > 0 && vfxValues.trigger) {
      baseValues.trigger = true;
    }
    return baseValues;
  }, [allVfxValues, vfxValues]);

  // ✅ ENHANCED: File import with spritesheet support
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    fileManager.loadJSON(file, (data) => {
      console.log('📂 Raw loaded data:', data);
      console.log('📂 Data keys:', Object.keys(data || {}));
      
      if (data.vfxSettings) {
        console.log('⚙️ Loading structured VFX settings file');
        
        if (updateVfxSettings) {
          updateVfxSettings(data.vfxSettings);
          console.log('✅ VFX settings restored');
        }
        
        // Update local controls to reflect loaded values
        console.log('🔍 About to call setAllVfxControls with:', data.vfxSettings);
        
        // ✅ FILTER: Remove transform values that don't belong in Leva controls
        const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scale, ...vfxOnlySettings } = data.vfxSettings;
        console.log('🔍 Filtered VFX settings (no transforms):', vfxOnlySettings);
        
        // Check if spritesheet settings are present
        if (vfxOnlySettings.useSpritesheet) {
          console.log('🎬 Spritesheet settings detected in loaded file');
        }
        
        setAllVfxControls(vfxOnlySettings);
        console.log('✅ Local controls updated');
        
        console.log('🎬 VFX settings loaded successfully');
      } 
      else if (data.pCount || data.color) {
        console.log('🔍 Loading legacy VFX settings file');
        
        if (updateVfxSettings) {
          updateVfxSettings(data);
          console.log('✅ Legacy VFX settings restored');
        }
        
        // Update local controls
        const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ, scale, ...legacyVfxSettings } = data;
        setAllVfxControls(legacyVfxSettings);
      }
      else {
        console.warn('⚠️ Unknown VFX file format');
        alert('Invalid VFX settings file format');
      }
      
      // Trigger animation to show loaded effect
      setVfxValues(prev => ({ ...prev, trigger: true }));
      setTimeout(() => {
        setVfxValues(prev => ({ ...prev, trigger: false }));
      }, 100);
    });
    
    // Reset file input
    e.target.value = '';
  };

  // Canvas styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      canvas {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      
      <Canvas
        shadows
        camera={{ 
          position: [5, 5, 5], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance" 
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4169E1" />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            autoRotate={false}
          />
          
          {/* Ground Grid */}
          <Grid 
            position={[0, -2, 0]}
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#333"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#666"
            fadeDistance={24}
            fadeStrength={1}
          />

          {/* ✅ ENHANCED: VfxEngine with spritesheet support */}
          <VfxEngine 
            allVfxValues={finalVfxValues}
            sprites={sprites}
            onComplete={() => {
              setVfxValues(prev => ({ ...prev, trigger: false }));
            }}
          />
          
          {/* Debug Stats */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
    </>
  );
};

export default VfxLevaControls;