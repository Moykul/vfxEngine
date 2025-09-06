// AnimationTimeline.jsx - UPDATED for dynamic track generation

import React, { useState, useRef, useEffect, useImperativeHandle, useCallback, useMemo } from 'react';
import { Timeline } from 'animation-timeline-js';

const AnimationTimeline = React.forwardRef(({ 
  visible = true,
  duration = 10000,
  onTimeChange = () => {},
  onKeyframeChange = () => {},
  onPlaybackChange = () => {},
  vfxValues = {},
  onLevaUpdate = () => {},
  className = '',
  // NEW: Dynamic configuration props
  initialModel = null,
  normalizeFunctions = null,
  parameterMapping = null,
  shouldPlay = false,
  // NEW: VFX trigger function
  triggerVfx = null
}, ref) => {
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const [timeline, setTimeline] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const playbackRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const TOTAL_FRAMES = Math.round((duration / 1000) * 30);
  const FPS = 30;
  
  const timeToFrame = (time) => Math.round((time / duration) * TOTAL_FRAMES);
  const frameToTime = (frame) => (frame / TOTAL_FRAMES) * duration;

  // Update refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);



  // UPDATED: Generate default model if none provided (fallback to old behavior)
  const getInitialModel = useMemo(() => {
    if (initialModel) {
      return initialModel;
    }
    
    // Fallback to hardcoded model for backward compatibility
    return {
    rows: [] // Add empty rows array for fallback
    };
  }, [initialModel]);

  // UPDATED: Dynamic normalize/denormalize functions
  const denormalizeValue = useCallback((parameterName, normalizedValue) => {
    if (normalizeFunctions && normalizeFunctions.denormalize[parameterName]) {
      return normalizeFunctions.denormalize[parameterName](normalizedValue);
    }
    
    // Fallback to hardcoded logic
    switch (parameterName) {
      case 'positionX':
      case 'positionY':
      case 'positionZ': 
        return (normalizedValue * 10) - 5;
      default: 
        return normalizedValue;
    }
  }, [normalizeFunctions]);

  const normalizeValue = useCallback((parameterName, value) => {
    if (normalizeFunctions && normalizeFunctions.normalize[parameterName]) {
      return normalizeFunctions.normalize[parameterName](value);
    }
    
    // Fallback to hardcoded logic
    switch (parameterName) {
      case 'positionX':
      case 'positionY':
      case 'positionZ': 
        return (value + 5) / 10;
      default: 
        return Math.max(0, Math.min(1, value));
    }
  }, [normalizeFunctions]);

  // UPDATED: Dynamic row index lookup
  const getRowIndexByName = useCallback((parameterName) => {
    const model = getInitialModel;
    if (!model || !model.rows) return -1;
    
    return model.rows.findIndex(row => row.name === parameterName);
  }, [getInitialModel]);

  // Initialize timeline with dynamic model
  useEffect(() => {
    if (!containerRef.current) return;
    
    const timelineInstance = new Timeline({ id: containerRef.current });
    const model = getInitialModel;
    
    console.log('=== TIMELINE INITIALIZATION DEBUG ===');
    console.log('Timeline model rows count:', model?.rows?.length);
    
    if (!model || !model.rows || model.rows.length === 0) {
      console.warn('⚠️ No model or empty rows array!');
      return;
    }
    
    // ADD DELAY - Let the timeline library initialize first
    setTimeout(() => {
      try {
        timelineInstance.setModel(model);
        timelineInstance.setTime(0);
        
        const verifyModel = timelineInstance.getModel();
        console.log('Rows after setting:', verifyModel?.rows?.length);
        
        setTimeline(timelineInstance);
        setIsInitialized(true);
      } catch (error) {
        console.error('Timeline initialization error:', error);
      }
    }, 100); // Small delay to let library initialize
    
    timelineInstance.onTimeChanged((event) => {
      const time = event.val;
      setCurrentTime(time);
      onTimeChange(time);
      
      const currentModel = timelineInstance.getModel();
      const hasKeyframes = currentModel && currentModel.rows && currentModel.rows.some(row => row.keyframes.length > 0);
      
      if (hasKeyframes) {
        const interpolatedValues = interpolateValuesAtTime(time, currentModel);
        const timelineData = {
          ...interpolatedValues,
          isPlaying: isPlayingRef.current,
          currentTime: time,
          timelineActive: true,
          trigger: true
        };
        onLevaUpdate(timelineData);
      }
    });

    timelineInstance.onKeyframeChanged((event) => {
      onKeyframeChange(event);
    });

    return () => {
      if (playbackRef.current) {
        cancelAnimationFrame(playbackRef.current);
      }
      if (timelineInstance) {
        timelineInstance.dispose();
      }
    };
  }, [duration, getInitialModel]);

  // UPDATED: Dynamic interpolation with fallback
  const interpolateValuesAtTime = useCallback((time, model) => {
    const interpolated = {};
    
    if (!model || !model.rows) return interpolated;
    
    model.rows.forEach((row) => {
      const keyframes = row.keyframes.sort((a, b) => a.val - b.val);
      
      if (keyframes.length === 0) return;
      
      if (keyframes.length === 1) {
        interpolated[row.name] = denormalizeValue(row.name, keyframes[0].data?.value || 0);
        return;
      }
      
      let beforeFrame = null;
      let afterFrame = null;
      
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].val <= time && keyframes[i + 1].val >= time) {
          beforeFrame = keyframes[i];
          afterFrame = keyframes[i + 1];
          break;
        }
      }
      
      if (!beforeFrame && !afterFrame) {
        if (time <= keyframes[0].val) {
          interpolated[row.name] = denormalizeValue(row.name, keyframes[0].data?.value || 0);
        } else {
          interpolated[row.name] = denormalizeValue(row.name, keyframes[keyframes.length - 1].data?.value || 0);
        }
        return;
      }
      
      if (beforeFrame && afterFrame) {
        const timeDiff = afterFrame.val - beforeFrame.val;
        const progress = timeDiff === 0 ? 0 : (time - beforeFrame.val) / timeDiff;
        
        const beforeValue = beforeFrame.data?.value || 0;
        const afterValue = afterFrame.data?.value || 0;
        
        const interpolatedValue = beforeValue + (afterValue - beforeValue) * progress;
        
        interpolated[row.name] = denormalizeValue(row.name, interpolatedValue);
      }
    });
    
    return interpolated;
  }, [denormalizeValue]);

  // Expose timeline methods through ref
  useImperativeHandle(ref, () => ({
    getTimeline: () => timeline,
    getCurrentTime: () => currentTime,
    setCurrentTime: (time) => setCurrentTime(time),
    setTime: (time) => {
      if (timeline && timeline.setTime) {
        try {
          timeline.setTime(time);
          setCurrentTime(time);
        } catch (error) {
          console.error('Error setting timeline time:', error);
        }
      }
    },
    play: () => {
      setIsPlaying(true);
    },
    pause: () => {
      setIsPlaying(false);
    },
    isPlaying: () => isPlaying,
    isInitialized: () => isInitialized,
    addKeyframe: (parameterName, value, time) => {
      if (!timeline || !isInitialized) {
        return false;
      }
      try {
        const model = timeline.getModel();
        if (!model || !model.rows) {
          return false;
        }
        const rowIndex = getRowIndexByName(parameterName);
        if (rowIndex < 0 || !model.rows[rowIndex]) {
          console.warn(`Invalid row index ${rowIndex} for parameter ${parameterName}`);
          return false;
        }
        const normalizedValue = normalizeValue(parameterName, value);
        const row = model.rows[rowIndex];
        const keyframes = row.keyframes;
        const EPSILON = 50;
        const existingIndex = keyframes.findIndex(kf => Math.abs(kf.val - time) < EPSILON);
        if (existingIndex >= 0) {
          keyframes[existingIndex].data = { value: normalizedValue };
        } else {
          keyframes.push({
            val: time,
            selected: false,
            data: { value: normalizedValue }
          });
          keyframes.sort((a, b) => a.val - b.val);
        }
        timeline.setModel(model);
        setTimeout(() => {
          if (timeline.redraw) {
            timeline.redraw();
          }
        }, 50);
        return true;
      } catch (error) {
        console.error('Keyframe creation failed:', error);
        return false;
      }
    },
    deleteKeyframe: (parameterName, time) => {
      if (!timeline || !isInitialized) return false;
      try {
        const model = timeline.getModel();
        if (!model || !model.rows) return false;
        const rowIndex = getRowIndexByName(parameterName);
        if (rowIndex < 0 || !model.rows[rowIndex]) return false;
        const row = model.rows[rowIndex];
        const keyframes = row.keyframes;
        if (!keyframes.length) return false;
        const EPSILON = 50;
        const idx = keyframes.findIndex(kf => Math.abs(kf.val - time) < EPSILON);
        if (idx >= 0) {
          keyframes.splice(idx, 1);
          timeline.setModel(model);
          setTimeout(() => {
            if (timeline.redraw) timeline.redraw();
          }, 50);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Keyframe deletion failed:', error);
        return false;
      }
    }
  }), [timeline, currentTime, isPlaying, isInitialized, getRowIndexByName, normalizeValue]);

  // Rest of the component remains the same (play, stop, drag functionality)...
  // [Previous play, stop, drag code unchanged]
  
  const play = useCallback(() => {
    console.log('🎵 AnimationTimeline play() called - isInitialized:', isInitialized, 'isPlaying:', isPlaying);
    if (!timeline || !isInitialized || isPlaying) {
      console.log('🚫 Play blocked - timeline:', !!timeline, 'isInitialized:', isInitialized, 'isPlaying:', isPlaying);
      return;
    }
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    let startTime = currentTime;
    if (currentTime >= duration - 100) {
      startTime = 0;
      timeline.setTime(0);
      setCurrentTime(0);
    }
    console.log('🎵 Setting isPlaying to true and calling onPlaybackChange(true)');
    setIsPlaying(true);
    isPlayingRef.current = true;
    onPlaybackChange(true);
    
    // ✅ NEW: Also trigger VFX animation (same as "Fire Current Settings!" button)
    if (triggerVfx) {
      console.log('🎵 Timeline play button also triggering VFX');
      triggerVfx();
    }
    
    let performanceStartTime = null;
    const animate = (timestamp) => {
      try {
        if (performanceStartTime === null) {
          performanceStartTime = timestamp;
        }
        const elapsed = timestamp - performanceStartTime;
        let newTime = Math.min(startTime + elapsed, duration);
        timeline.setTime(newTime);
        setCurrentTime(newTime);
        if (newTime < duration) {
          playbackRef.current = requestAnimationFrame(animate);
        } else {
          if (isLoopingRef.current) {
            performanceStartTime = null;
            startTime = 0;
            timeline.setTime(0);
            setCurrentTime(0);
            playbackRef.current = requestAnimationFrame(animate);
          } else {
            playbackRef.current = null;
            setIsPlaying(false);
            isPlayingRef.current = false;
            onPlaybackChange(false);
          }
        }
      } catch (error) {
        playbackRef.current = null;
        setIsPlaying(false);
        isPlayingRef.current = false;
        onPlaybackChange(false);
      }
    };
    playbackRef.current = requestAnimationFrame(animate);
  }, [timeline, isInitialized, isPlaying, currentTime, duration, onPlaybackChange]);

  const stop = useCallback(() => {
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    
    setIsPlaying(false);
    isPlayingRef.current = false;

    if (timeline && timeline.setTime) {
      try {
        timeline.setTime(0);
        setCurrentTime(0);
      } catch (error) {
        console.error('Error stopping timeline:', error);
      }
    }
    onPlaybackChange(false);
  }, [timeline, onPlaybackChange]);

    useEffect(() => {
      if (shouldPlay && !isPlaying) {
        play(); // This triggers the timeline to start
        }
    }, [shouldPlay, isPlaying, play]);

  // Drag handlers remain the same...
  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    const timelineContainer = e.currentTarget.closest('.timeline-container');
    const rect = timelineContainer.getBoundingClientRect();
    
    timelineContainer.classList.add('dragging');
    timelineContainer.style.width = '360px';
    timelineContainer.style.right = 'auto';
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  }, []);

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.style.left = `${e.clientX - dragOffset.x}px`;
      timelineContainer.style.top = `${e.clientY - dragOffset.y}px`;
    }
    e.preventDefault();
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.classList.remove('dragging');
    }
    
    if (timeline && timeline.redraw) {
      setTimeout(() => {
        try {
          timeline.redraw();
        } catch (error) {
          console.error('Error redrawing timeline after drag:', error);
        }
      }, 100);
    }
  }, [timeline]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // UPDATED: Dynamic track labels
  const renderTrackLabels = () => {
    const model = getInitialModel;
    if (!model || !model.rows) return null;
    
    return model.rows.map((row, index) => (
      <div key={row.name} className="timeline-track-label">
        {row.displayName || row.name}
      </div>
    ));
  };

  return (
    <div 
      className={`timeline-container ${className}`}
      style={{ 
        display: visible ? 'flex' : 'none'
      }}
    >
      {!isInitialized && (
        <div style={{ padding: '10px', color: '#888', fontSize: '12px' }}>
          Initializing timeline...
        </div>
      )}
      
      <div className="timeline-toolbar">
        <div 
          className="timeline-drag-handle"
          title="Drag to move timeline"
          onMouseDown={handleDragStart}
        >
          <svg width="20" height="10" viewBox="0 0 28 14" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="2"></circle>
            <circle cx="14" cy="2" r="2"></circle>
            <circle cx="26" cy="2" r="2"></circle>
            <circle cx="2" cy="12" r="2"></circle>
            <circle cx="14" cy="12" r="2"></circle>
            <circle cx="26" cy="12" r="2"></circle>
          </svg>
        </div>
        
        <button className="timeline-tool-button" title="Go to start" onClick={() => {
          if (timeline && timeline.setTime && isInitialized) {
            try {
              if (playbackRef.current) {
                cancelAnimationFrame(playbackRef.current);
                playbackRef.current = null;
              }
              setIsPlaying(false);
              isPlayingRef.current = false;
              timeline.setTime(0);
              setCurrentTime(0);
            } catch (error) {
              console.error('Error going to start:', error);
            }
          }
        }} disabled={!isInitialized}>⏮</button>
        
        <button className="timeline-tool-button" title="Play timeline" onClick={play} disabled={isPlaying || !isInitialized}>▶</button>
        
        <button className="timeline-tool-button" title="Pause timeline" onClick={() => {
          if (playbackRef.current) {
            cancelAnimationFrame(playbackRef.current);
            playbackRef.current = null;
          }
          setIsPlaying(false);
          isPlayingRef.current = false;
          onPlaybackChange(false);
        }} disabled={!isPlaying || !isInitialized}>⏸</button>
        
        <button className="timeline-tool-button" title="Stop timeline" onClick={stop} disabled={!isInitialized}>⏹</button>
        
        <button className="timeline-tool-button" title="Go to end" onClick={() => {
          if (timeline && timeline.setTime && isInitialized) {
            try {
              timeline.setTime(duration);
              setCurrentTime(duration);
            } catch (error) {
              console.error('Error going to end:', error);
            }
          }
        }} disabled={!isInitialized}>⏭</button>
        
        <button className={`timeline-tool-button${isLooping ? ' active' : ''}`} title={isLooping ? 'Looping enabled' : 'Enable looping'} onClick={() => setIsLooping(l => !l)} disabled={!isInitialized} style={{ fontSize: '18px', fontWeight: 700 }}>⟳</button>
        
        <button className="timeline-tool-button" title="Delete keyframe at current time" onClick={() => {
          if (!timeline || !isInitialized) return;
          const model = getInitialModel;
          if (!model || !model.rows) return;
          
          let deleted = false;
          model.rows.forEach(row => {
            const res = ref && typeof ref !== 'function' && ref.current && ref.current.deleteKeyframe
              ? ref.current.deleteKeyframe(row.name, currentTime)
              : false;
            if (res) deleted = true;
          });
        }} disabled={!isInitialized}>X</button>
        
        <div className="timeline-spacer"></div>
        
        <div className="timeline-info">
          {isInitialized ? (
            <>Frame {timeToFrame(currentTime)} / {TOTAL_FRAMES} | {Math.round(currentTime)}ms</>
          ) : (
            <>Initializing...</>
          )}
        </div>
      </div>

      <div className="timeline-main">
        <div 
          ref={containerRef}
          className="timeline-canvas"
          style={{ 
            minHeight: '100%', 
            minWidth: '400px',
            position: 'relative',
            // backgroundColor: '#1a1a1a',
            // border: isInitialized ? 'none' : '1px dashed #666'
          }}
        />
        
        {/* NEW: Track names overlay on the timeline canvas */}
        <div className="timeline-track-names-overlay">
          {getInitialModel.rows?.map((row, index) => (
            <div key={row.name} className="timeline-track-name-overlay">
              {row.displayName || row.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AnimationTimeline;