import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getVfxValues } from '../components/vfx/VfxParameters.js';
import fileManager from '../components/timeline/fileManager';

// Context for sharing VFX settings between VfxLevaControls and TimelineLevaControls
const VfxSettingsContext = createContext();

export const useVfxSettings = () => {
  const context = useContext(VfxSettingsContext);
  if (!context) {
    throw new Error('useVfxSettings must be used within a VfxSettingsProvider');
  }
  return context;
};

export const VfxSettingsProvider = ({ children }) => {
  const [vfxSettings, setVfxSettings] = useState(() => getVfxValues());

  // Debug logging when settings change
  useEffect(() => {
    console.log('🔄 VFX Settings updated:', {
      shape: vfxSettings.shape,
      particleTexture: vfxSettings.particleTexture,
      pSize: vfxSettings.pSize,
      color: vfxSettings.color
    });
  }, [vfxSettings]);

  // Shallow compare helper to avoid unnecessary state updates
  const shallowEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (let i = 0; i < aKeys.length; i++) {
      const k = aKeys[i];
      if (a[k] !== b[k]) return false;
    }
    return true;
  };

  // Stable updater that skips when no actual change
  const updateVfxSettings = useCallback((update) => {
    setVfxSettings(prev => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update };
      return shallowEqual(prev, next) ? prev : next;
    });
  }, []);

  // Save VFX settings to file
  const saveVfxSettings = useCallback(() => {
    const exportData = {
      vfxSettings: vfxSettings,
      metadata: {
        version: "1.0",
        created: new Date().toISOString(),
        type: "vfx-settings-only",
        description: "VFX Effect Parameters"
      }
    };
    
    console.log('💾 Saving VFX settings from context:', vfxSettings);
    fileManager.saveJSON(exportData, 'vfx-settings.json');
  }, [vfxSettings]);

  // Load VFX settings from file data
  const loadVfxSettings = useCallback((data) => {
    let loadedValues;
    
    // Handle both structured and legacy formats
    if (data.vfxSettings) {
      console.log('📂 Loading structured VFX settings');
      loadedValues = data.vfxSettings;
    } else if (data.pCount || data.color) {
      console.log('📂 Loading legacy VFX settings');
      loadedValues = data;
    } else {
      console.warn('⚠️ Unknown VFX settings format');
      throw new Error('Invalid VFX settings file format');
    }
    
    updateVfxSettings(loadedValues);
    console.log('✅ VFX settings loaded into context');
    return loadedValues;
  }, [updateVfxSettings]);

  const contextValue = useMemo(() => ({ 
    vfxSettings, 
    updateVfxSettings, 
    saveVfxSettings, 
    loadVfxSettings 
  }), [vfxSettings, updateVfxSettings, saveVfxSettings, loadVfxSettings]);

  return (
    <VfxSettingsContext.Provider value={contextValue}>
      {children}
    </VfxSettingsContext.Provider>
  );
};
