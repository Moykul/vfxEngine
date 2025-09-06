import React, { useState, useCallback, useRef, useMemo, createContext, useContext, useEffect } from 'react';
import { useControls, button, folder } from 'leva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import AnimationTimeline from './AnimationTimeline';
import VfxEngine from '../vfx/VfxEngine.jsx';
import fileManager from './fileManager';
import { useVfxSettings } from '../../contexts/VfxSettingsContext.jsx';
import { useVfxSprites } from '../../hooks/index.js';
import { useVfxSpritesheets } from '../../hooks/useVfxSpritesheets.js';
import { getVfxValues } from '../vfx/VfxParameters.js';
import VFX_PRESETS, { getPreset, listPresets } from '../vfx/vfxPresets.js';

// Debug flag
const DEBUG = false;

const TimelineController = () => {
  // ✅ RESTORED: Read VFX settings from shared context
  const { vfxSettings, updateVfxSettings } = useVfxSettings();
  
  // ✅ FIXED: Add sprite hooks to match VfxLevaControls
  const { sprites, spriteCategories } = useVfxSprites();
  const { spritesheets, spritesheetOptions, animationModeOptions, getSpritesheetMetadata } = useVfxSpritesheets();
  
  // ✅ HELPER: Get value from context with fallback to defaults
  const getConfigValue = useCallback((key, defaultValue) => {
    if (!vfxSettings || typeof vfxSettings !== 'object') {
      return getVfxValues()[key] !== undefined ? getVfxValues()[key] : defaultValue;
    }
    return vfxSettings[key] !== undefined ? vfxSettings[key] : defaultValue;
  }, [vfxSettings]);

  // ✅ ENHANCED: Combined texture options (basic + extended) - FIXED to match VfxLevaControls format
  const allTextureOptions = useMemo(() => {
    console.log('🖼️ Building texture options - sprites:', sprites?.length || 0, 'categories:', spriteCategories?.length || 0);
    
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
    if (sprites && sprites.length > 0) {
      spriteCategories.forEach(category => {
        options[`-- ${category.toUpperCase()} --`] = '';
        const categorySprites = sprites.filter(sprite => sprite.category === category);
        console.log(`🖼️ Category ${category}:`, categorySprites.length, 'sprites');
        categorySprites.forEach(sprite => {
          options[sprite.name] = sprite.name;
        });
      });
    }
    
    console.log('🖼️ Final texture options:', Object.keys(options).length, 'total options');
    return options;
  }, [sprites, spriteCategories]);
  
  // ✅ PROVEN PATTERN: Enhanced parameter definitions with organized grouping (from R3F reference)
  const parameterDefinitions = useMemo(() => ({
    // Transform parameters - following exact R3F pattern
    positionX: { 
      value: 0, min: -10, max: 10, step: 0.1,
      timelineName: 'positionX',
      displayName: '🔧 Position X',
      color: '#3B82F6',
      strokeColor: '#2563EB',
      group: 'transform'
    },
    positionY: { 
      value: 0, min: -10, max: 10, step: 0.1,
      timelineName: 'positionY', 
      displayName: '🔧 Position Y',
      color: '#10B981',
      strokeColor: '#059669',
      group: 'transform'
    },
    positionZ: { 
      value: 0, min: -10, max: 10, step: 0.1,
      timelineName: 'positionZ',
      displayName: '🔧 Position Z', 
      color: '#F59E0B',
      strokeColor: '#D97706',
      group: 'transform'
    },

    // Rotation parameters
    rotationX: {
      value: 0, min: 0, max: 360, step: 1,
      timelineName: 'rotationX',
      displayName: '🔄 Rotation X',
      color: '#EF4444',
      strokeColor: '#DC2626',
      group: 'rotation'
    },
    rotationY: {
      value: 0, min: 0, max: 360, step: 1,
      timelineName: 'rotationY',
      displayName: '🔄 Rotation Y',
      color: '#F97316',
      strokeColor: '#EA580C',
      group: 'rotation'
    },
    rotationZ: {
      value: 0, min: 0, max: 360, step: 1,
      timelineName: 'rotationZ',
      displayName: '🔄 Rotation Z',
      color: '#84CC16',
      strokeColor: '#65A30D',
      group: 'rotation'
    },

    // Scale parameter
    scale: {
      value: 1, min: 0.1, max: 5, step: 0.1,
      timelineName: 'scale',
      displayName: '📏 Scale',
      color: '#8B5CF6', 
      strokeColor: '#7C3AED',
      group: 'scale'
    },

    // Opacity parameter
    opacity: {
      value: 1.0, min: 0.0, max: 1.0, step: 0.1,
      timelineName: 'opacity',
      displayName: '👻 Opacity',
      color: '#EC4899',
      strokeColor: '#DB2777',
      group: 'opacity'
    }
  }), []);

  // ✅ PROVEN PATTERN: Generate Leva controls from parameter definitions (exact R3F pattern)
  const levaConfig = useMemo(() => {
    const config = {};
    Object.entries(parameterDefinitions).forEach(([key, def]) => {
      config[key] = {
        value: def.value,
        min: def.min,
        max: def.max,
        step: def.step
      };
    });
    return config;
  }, [parameterDefinitions]);

  const [vfxValues, setVfxValues] = useControls('VFX Transform', () => levaConfig);

  // ✅ ENHANCED: VFX Controls (all the missing controls from VfxLevaControls)
  const vfxConfig = useMemo(() => ({
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
    'Colors & Effects': folder({
      color: { value: getConfigValue('color', '#ff6030') },
      colorEnd: { value: getConfigValue('colorEnd', '#ff0030') },
      useGradient: { value: getConfigValue('useGradient', false) },
      blendMode: { 
        value: getConfigValue('blendMode', 0),
        options: { 'Additive': 0, 'Normal': 1, 'Multiply': 2, 'Subtractive': 3 }
      }
    }),
    'Physics': folder({
      gravity: { value: getConfigValue('gravity', 0), min: -15.0, max: 15.0, step: 0.1 },
      turbulence: { value: getConfigValue('turbulence', 0), min: 0.0, max: 5.0, step: 0.1 },
      directionalForceX: { value: getConfigValue('directionalForceX', 0), min: -10.0, max: 10.0, step: 0.1 },
      directionalForceY: { value: getConfigValue('directionalForceY', 0), min: -10.0, max: 10.0, step: 0.1 },
      directionalForceZ: { value: getConfigValue('directionalForceZ', 0), min: -10.0, max: 10.0, step: 0.1 },
      streakLength: { value: getConfigValue('streakLength', 0), min: 0.0, max: 2.0, step: 0.1 }
    }),
    'Shape & Texture': folder({
      shape: {
        value: getConfigValue('shape', 'explosion'),
        options: ['explosion', 'sphere', 'box', 'cone', 'circle', 'square', 'spiral', 'wave', 'glb', 'model', 'tornado']
      },
      shapeHeight: { value: getConfigValue('shapeHeight', 2.0), min: 0.5, max: 10.0, step: 0.1 },
      shapeAngle: { value: getConfigValue('shapeAngle', 0), min: 0, max: 360, step: 1 },
      heightMultiplier: { value: getConfigValue('heightMultiplier', 1.0), min: 0.1, max: 5.0, step: 0.1 },
      animationPreset: {
        value: getConfigValue('animationPreset', 'none'),
        options: ['none', 'fadeIn', 'fadeOut', 'spiral', 'burst', 'gravity']
      },
      particleTexture: {
        value: getConfigValue('particleTexture', 'Circle'),
        options: allTextureOptions,
        label: 'Texture (Basic + Extended)'
      },
      motionBlur: { value: getConfigValue('motionBlur', false) }
    }),
    'Trails': folder({
      trailEnabled: { value: getConfigValue('trailEnabled', false), label: 'Enable Trails' },
      trailLength: { value: getConfigValue('trailLength', 4), min: 1, max: 16, step: 1, label: 'Trail Samples' },
      trailDamping: { value: getConfigValue('trailDamping', 1.2), min: 0.1, max: 3.0, step: 0.1, label: 'Trail Damping' },
      trailSize: { value: getConfigValue('trailSize', 0.02), min: 0.0, max: 0.2, step: 0.005, label: 'Trail Size' }
    }),
    'Animated Textures': folder({
      useSpritesheet: { 
        value: getConfigValue('useSpritesheet', false),
        label: '🎬 Use Animated Spritesheet'
      },
      spritesheetName: {
        value: getConfigValue('spritesheetName', 'pow_explosion_5x5'),
        options: spritesheetOptions,
        label: 'Spritesheet',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      },
      spritesheetFrameRate: {
        value: getConfigValue('spritesheetFrameRate', 24),
        min: 1,
        max: 60,
        step: 1,
        label: 'Frame Rate (fps)',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      },
      spritesheetAnimationMode: {
        value: getConfigValue('spritesheetAnimationMode', 'once'),
        options: animationModeOptions,
        label: 'Animation Mode',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      },
      spritesheetRandomStart: {
        value: getConfigValue('spritesheetRandomStart', false),
        label: 'Random Start Frames',
        render: (get) => get('VFX Controls.Animated Textures.useSpritesheet'),
      }
    }),
    'Tornado': folder({
      tornadoEnabled: { 
        value: getConfigValue('tornadoEnabled', false),
        label: '🌪️ Enable Tornado'
      },
      tornadoHeight: { 
        value: getConfigValue('tornadoHeight', 8.0), 
        min: 1, max: 20, step: 0.1,
        label: 'Height'
      },
      baseDiameter: { 
        value: getConfigValue('baseDiameter', 0.5), 
        min: 0.1, max: 3, step: 0.1,
        label: 'Base Width'
      },
      topDiameter: { 
        value: getConfigValue('topDiameter', 3.0), 
        min: 0.1, max: 8, step: 0.1,
        label: 'Top Width'
      },
      verticalSpeed: { 
        value: getConfigValue('verticalSpeed', 1.0), 
        min: 0, max: 5, step: 0.1,
        label: 'Vertical Speed'
      },
      rotationSpeed: { 
        value: getConfigValue('rotationSpeed', 1.0), 
        min: 0, max: 36, step: 3,
        label: 'Rotation Speed'
      },
      vortexStrength: { 
        value: getConfigValue('vortexStrength', 1.0), 
        min: 0, max: 5, step: 0.1,
        label: 'Vortex Strength'
      },
      spiralSpin: { 
        value: getConfigValue('spiralSpin', 2.0), 
        min: -10, max: 10, step: 0.1,
        label: 'Spiral Intensity'
      },
      heightColorGradient: { 
        value: getConfigValue('heightColorGradient', false),
        label: 'Height Color Gradient'
      }
    })
  }), [vfxSettings, allTextureOptions, spritesheetOptions, animationModeOptions, getConfigValue]);

  const [allVfxControls, setAllVfxControls] = useControls('VFX Controls', () => vfxConfig);

  // ✅ ENHANCED: VFX Actions
  const actionControls = useControls("🚀 VFX Actions", {
    'Fire Current Settings!': button(() => {
      console.log('🚀 Triggering VFX with current settings');
      setIsTimelinePlaying(true);
      setTimeout(() => setIsTimelinePlaying(false), (vfxSettings.duration || 3.0) * 1000);
    }),
    'Debug Values': button(() => {
      console.log('🔍 Current VFX Values:', {
        transforms: vfxValues,
        effects: allVfxControls,
        context: vfxSettings
      });
    })
  });

  // ✅ PRESETS: Add preset controls - FIXED logic issue
  const presetNames = useMemo(() => {
    const names = listPresets();
    console.log('🎛️ Available presets:', names);
    return names;
  }, []);
  const [presetControls, setPresetControls] = useControls('🎛️ Presets', () => ({
    presetSelection: {
      value: presetNames[0] || '',
      options: presetNames
    },
    'Apply Preset': button(() => {
      // This will trigger the useEffect below when the button is clicked
      // We can't access presetControls.presetSelection here yet
      console.log('🎛️ Apply Preset button clicked, current selection:', presetControls.presetSelection);
    })
  }));

  // ✅ FIXED: Apply preset when selection changes OR when button is clicked
  useEffect(() => {
    const selectedName = presetControls.presetSelection;
    if (!selectedName) return;
    
    const preset = getPreset(selectedName);
    if (preset) {
      console.log('🎛️ Applying preset:', selectedName);
      // Update shared context
      updateVfxSettings(preset);
      // Update local Leva controls
      try {
        // Filter preset to only include keys that exist in current controls
        const filteredPreset = {};
        Object.keys(preset).forEach(key => {
          // Only include VFX parameters, not transform parameters
          if (!['positionX', 'positionY', 'positionZ', 'rotationX', 'rotationY', 'rotationZ', 'scale', 'opacity'].includes(key)) {
            filteredPreset[key] = preset[key];
          }
        });
        setAllVfxControls(filteredPreset);
      } catch (error) {
        console.warn('⚠️ Could not apply all preset values to Leva controls:', error);
      }
    }
  }, [presetControls.presetSelection, updateVfxSettings, setAllVfxControls]);

  // ✅ UPDATE: Sync VFX controls with context
  useEffect(() => {
    const vfxParams = {
      ...allVfxControls
    };
    updateVfxSettings(vfxParams);
  }, [allVfxControls, updateVfxSettings]);


  // ✅ PROVEN PATTERN: Generate timeline model from parameter definitions (exact R3F pattern)
  const timelineModel = useMemo(() => {
    const rows = Object.entries(parameterDefinitions).map(([levaKey, def]) => ({
      name: def.timelineName,
      displayName: def.displayName,
      keyframes: [],
      style: { 
        fillStyle: def.color, 
        strokeColor: def.strokeColor, 
        height: 21 
      },
      _levaKey: levaKey,
      _min: def.min,
      _max: def.max,
      _group: def.group
    }));

    return { rows };
  }, [parameterDefinitions]);

  // ✅ PROVEN PATTERN: Create normalization functions (exact R3F pattern)
  const createNormalizeFunctions = useMemo(() => {
    const normalize = {};
    const denormalize = {};
    
    Object.entries(parameterDefinitions).forEach(([levaKey, def]) => {
      const timelineName = def.timelineName;
      const range = def.max - def.min;
      
      normalize[timelineName] = (value) => {
        return (value - def.min) / range;
      };
      
      denormalize[timelineName] = (normalizedValue) => {
        return def.min + (normalizedValue * range);
      };
    });
    
    return { normalize, denormalize };
  }, [parameterDefinitions]);

  // ✅ PROVEN PATTERN: Create parameter mapping (exact R3F pattern)
  const parameterMapping = useMemo(() => {
    const timelineToLeva = {};
    const levaToTimeline = {};
    
    Object.entries(parameterDefinitions).forEach(([levaKey, def]) => {
      timelineToLeva[def.timelineName] = levaKey;
      levaToTimeline[levaKey] = def.timelineName;
    });
    
    return { timelineToLeva, levaToTimeline };
  }, [parameterDefinitions]);

  // ✅ PROVEN PATTERN: Timeline controls (exact R3F pattern)
  const fileInputRef = useRef();
  const [{ timelineVisible }, setTimelineVisible] = useControls('Timeline', () => ({
    timelineVisible: { value: true, label: 'Show Timeline' },
    exportAnimation: button(() => {
      const timeline = timelineRef.current && timelineRef.current.getTimeline ? timelineRef.current.getTimeline() : null;
      if (!timeline) return;
      const model = timeline.getModel ? timeline.getModel() : null;
      if (!model) return;
      
      // ✅ COMBINED: Export both VFX settings and timeline data
      const combinedData = {
        vfxSettings: vfxSettings,
        timeline: model,
        metadata: {
          version: "1.0",
          created: new Date().toISOString(),
          duration: (vfxSettings.duration || 3.0) * 1000,
          description: "VFX Animation with Timeline"
        }
      };
      
      fileManager.saveJSON(combinedData, 'vfx-animation-complete.json');
    }),
    importAnimation: button(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    })
  }));

  // ✅ PROVEN PATTERN: State and refs (exact R3F pattern)
  const [currentTime, setCurrentTime] = useState(0);
  const timelineRef = useRef(null);
  const timelineDrivenRef = useRef(false);
  const isPlayingRef = useRef(false);
  const prevUserValuesRef = useRef({ ...vfxValues });

  // ✅ PROVEN PATTERN: Handle timeline updates with organized data structure (exact R3F pattern)
  const handleLevaUpdate = useCallback((interpolated) => {
    if (!interpolated) return;
    
    isPlayingRef.current = interpolated.isPlaying || false;
    
    // Convert timeline values to Leva updates
    const updates = {};
    Object.entries(interpolated).forEach(([timelineName, value]) => {
      if (value !== undefined && parameterMapping.timelineToLeva[timelineName]) {
        const levaKey = parameterMapping.timelineToLeva[timelineName];
        updates[levaKey] = value;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      timelineDrivenRef.current = true;
      setVfxValues(updates);
      setTimeout(() => { timelineDrivenRef.current = false; }, 0);
    }
  }, [setVfxValues, parameterMapping]);

  // ✅ RESTORED: Track timeline playing state for VFX trigger
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);

  const handlePlaybackChange = useCallback((playing) => {
    isPlayingRef.current = playing;
    setIsTimelinePlaying(playing);
  }, []);

  // ✅ PROVEN PATTERN: Handle manual Leva control updates (exact R3F pattern)
  useEffect(() => {
    // Skip if timeline is driving the changes
    if (timelineDrivenRef.current || isPlayingRef.current) return;
    
    console.log('🎮 VFX Leva values changed:', vfxValues);

    // Handle keyframe creation
    const timeline = timelineRef.current;
    if (timeline && timeline.addKeyframe && timeline.isInitialized()) {
      // Check all parameters dynamically
      Object.entries(parameterDefinitions).forEach(([levaKey, def]) => {
        const currentValue = vfxValues[levaKey];
        const prevValue = prevUserValuesRef.current[levaKey];
        
        if (Math.abs(currentValue - prevValue) > (def.step || 0.001)) {
          timeline.addKeyframe(def.timelineName, currentValue, currentTime);
          prevUserValuesRef.current[levaKey] = currentValue;
        }
      });
    }
  }, [vfxValues, currentTime, parameterDefinitions]);

  // ✅ COMBINED: File import for both VFX settings and timeline data
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    fileManager.loadJSON(file, (data) => {
      const timeline = timelineRef.current && timelineRef.current.getTimeline ? timelineRef.current.getTimeline() : null;
      
      // Check if it's the new combined format
      if (data.vfxSettings && data.timeline) {
        console.log('📁 Loading combined VFX animation file');
        
        // Update VFX settings first
        if (updateVfxSettings) {
          updateVfxSettings(data.vfxSettings);
          console.log('✅ VFX settings restored');
        }
        
        // Update timeline data
        if (timeline && timeline.setModel) {
          timeline.setModel(data.timeline);
          console.log('✅ Timeline data restored');
        }
        
        console.log('🎬 Combined animation loaded successfully');
      } 
      // Legacy format - just timeline data
      else if (data.rows) {
        console.log('📁 Loading legacy timeline file');
        if (timeline && timeline.setModel) {
          timeline.setModel(data);
        }
      }
      // Unknown format
      else {
        console.warn('⚠️ Unknown file format');
        alert('Invalid animation file format');
      }
    });
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

          {/* ✅ RESTORED: VfxEngine using shared context + timeline transforms + VFX controls + trigger */}
          <VfxEngine 
            allVfxValues={{
              // ✅ VFX Controls: All the particle effect parameters
              ...allVfxControls,
              // ✅ RESTORED: Use shared VFX settings from context as fallback
              ...vfxSettings,
              // ✅ Transform overrides from timeline
              positionX: vfxValues.positionX,
              positionY: vfxValues.positionY,
              positionZ: vfxValues.positionZ,
              rotationX: vfxValues.rotationX,
              rotationY: vfxValues.rotationY,
              rotationZ: vfxValues.rotationZ,
              scale: vfxValues.scale,
              opacity: vfxValues.opacity,
              // ✅ RESTORED: Trigger VFX animation when timeline plays
              trigger: isTimelinePlaying
            }}
            sprites={sprites}
            onComplete={() => {
              setIsTimelinePlaying(false);
            }}
          />
          
          {/* Debug Stats */}
          {DEBUG && <Stats />}
        </Suspense>
      </Canvas>
      
      {/* ✅ PROVEN PATTERN: Timeline with exact same props as R3F reference */}
      <AnimationTimeline
        ref={timelineRef}
        visible={timelineVisible}
        duration={(vfxSettings.duration || 3.0) * 1000}
        levaValues={vfxValues}
        onLevaUpdate={handleLevaUpdate}
        onTimeChange={setCurrentTime}
        onPlaybackChange={handlePlaybackChange}
        initialModel={timelineModel}
        normalizeFunctions={createNormalizeFunctions}
        parameterMapping={parameterMapping}
      />
    </>
  );
};

export default TimelineController;