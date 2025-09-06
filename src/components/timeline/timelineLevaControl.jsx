import React, { useState, useCallback, useRef, useMemo, createContext, useContext, useEffect } from 'react';
import { useControls, button } from 'leva';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Suspense } from 'react';
import AnimationTimeline from './AnimationTimeline';
import VfxEngine from '../vfx/VfxEngine.jsx';
import fileManager from './fileManager';
import { useVfxSettings } from '../../contexts/VfxSettingsContext.jsx';
import { useVfxSprites } from '../../hooks/index.js';
import { useVfxSpritesheets } from '../../hooks/useVfxSpritesheets.js';

// Debug flag
const DEBUG = false;

const TimelineController = () => {
  // ✅ RESTORED: Read VFX settings from shared context
  const { vfxSettings, updateVfxSettings } = useVfxSettings();
  
  // ✅ FIXED: Add sprite hooks to match VfxLevaControls
  const { sprites, spriteCategories } = useVfxSprites();
  const { spritesheets, spritesheetOptions, animationModeOptions, getSpritesheetMetadata } = useVfxSpritesheets();
  
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
    console.log('🎬 Timeline handlePlaybackChange called:', playing);
    isPlayingRef.current = playing;
    setIsTimelinePlaying(playing);
    console.log('🎬 isTimelinePlaying set to:', playing);
  }, []);

  // ✅ NEW: Direct VFX trigger function (same as "Fire Current Settings!" button)
  const triggerVfx = useCallback(() => {
    console.log('🚀 Timeline triggering VFX directly');
    setVfxValues(prev => ({ ...prev, trigger: true }));
    // Auto-reset trigger after brief moment
    setTimeout(() => {
      setVfxValues(prev => ({ ...prev, trigger: false }));
    }, 100);
  }, [setVfxValues]);

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

          {/* ✅ RESTORED: VfxEngine using shared context + timeline transforms + trigger */}
          <VfxEngine 
            allVfxValues={{
              // ✅ RESTORED: Use shared VFX settings from context
              ...vfxSettings,
              // Timeline transform overrides
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
        triggerVfx={triggerVfx}
      />
    </>
  );
};

export default TimelineController;