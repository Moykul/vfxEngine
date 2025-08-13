import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getDefaultVfxValues } from '../components/vfx/VfxDefaults.js';

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
  const [vfxSettings, setVfxSettings] = useState(() => getDefaultVfxValues());

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

  const contextValue = useMemo(() => ({ vfxSettings, updateVfxSettings }), [vfxSettings, updateVfxSettings]);

  return (
    <VfxSettingsContext.Provider value={contextValue}>
      {children}
    </VfxSettingsContext.Provider>
  );
};
