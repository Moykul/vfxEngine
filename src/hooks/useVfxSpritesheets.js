// hooks/useVfxSpritesheets.js - Debug version to find the issue
import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

// ✅ IMPORT: Your actual spritesheets.json file
import spritesheetDefinitions from '../assets/spritesheets/spritesheets.json';

// ✅ IMPORT: Your actual spritesheet images
import powExplosion from '../assets/spritesheets/POW.png';

// ✅ MAP: Image imports to filenames
const importSpritesheetTextures = {
  'POW.png': powExplosion,
};

// 🔍 DEBUG: Log what we imported
console.log('🔍 DEBUG - spritesheetDefinitions:', spritesheetDefinitions);
console.log('🔍 DEBUG - powExplosion import:', powExplosion);
console.log('🔍 DEBUG - importSpritesheetTextures:', importSpritesheetTextures);

export const useVfxSpritesheets = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [spritesheets, setSpritesheets] = useState([]);

  const loadActualSpritesheets = async () => {
    const loadedSpritesheets = [];
    
    console.log('🔍 DEBUG - Starting to load spritesheets...');
    console.log('🔍 DEBUG - spritesheetDefinitions entries:', Object.entries(spritesheetDefinitions));
    
    for (const [key, definition] of Object.entries(spritesheetDefinitions)) {
      console.log(`🔍 DEBUG - Processing: ${key}`, definition);
      
      try {
        const textureUrl = importSpritesheetTextures[definition.texture];
        console.log(`🔍 DEBUG - Looking for texture: ${definition.texture}`);
        console.log(`🔍 DEBUG - Found textureUrl:`, textureUrl);
        
        if (!textureUrl) {
          console.warn(`⚠️ Texture not imported: ${definition.texture}`);
          continue;
        }
        
        console.log(`🔄 Loading texture for: ${definition.name}`);
        
        // Load the actual texture
        const texture = await new Promise((resolve, reject) => {
          new THREE.TextureLoader().load(
            textureUrl,
            (loadedTexture) => {
              console.log(`✅ Loaded spritesheet: ${definition.name}`);
              resolve(loadedTexture);
            },
            undefined,
            (error) => {
              console.error(`❌ Failed to load: ${definition.name}`, error);
              reject(error);
            }
          );
        });
        
        // Configure texture for optimal performance
        texture.flipY = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        
        // Add metadata from JSON definition
        texture.name = definition.name;
        texture.spritesheetKey = key;
        texture.framesX = definition.framesX;
        texture.framesY = definition.framesY;
        texture.totalFrames = definition.totalFrames;
        texture.frameRate = definition.frameRate;
        texture.category = definition.category;
        texture.animationMode = definition.animationMode;
        texture.description = definition.description;
        
        loadedSpritesheets.push(texture);
        
      } catch (error) {
        console.error(`❌ Failed to load spritesheet: ${definition.name}`, error);
      }
    }
    
    console.log('🔍 DEBUG - loadActualSpritesheets result:', loadedSpritesheets);
    return loadedSpritesheets;
  };

  const createDemoSpritesheets = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const demoSpritesheets = [];
    
    console.log('🔍 DEBUG - Creating demo spritesheets...');
    
    // Only create demos for entries that don't have real imports
    for (const [key, definition] of Object.entries(spritesheetDefinitions)) {
      const hasRealTexture = importSpritesheetTextures[definition.texture];
      console.log(`🔍 DEBUG - ${key}: hasRealTexture = ${!!hasRealTexture}`);
      
      if (hasRealTexture) {
        console.log(`🔍 DEBUG - Skipping demo for ${key} (has real texture)`);
        continue; // Skip if we have the real texture
      }
      
      console.log(`🔍 DEBUG - Creating demo for ${key}`);
      
      // Create demo version
      canvas.width = 512;
      canvas.height = 512;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const frameWidth = canvas.width / definition.framesX;
      const frameHeight = canvas.height / definition.framesY;
      
      for (let y = 0; y < definition.framesY; y++) {
        for (let x = 0; x < definition.framesX; x++) {
          const frameIndex = y * definition.framesX + x;
          if (frameIndex >= definition.totalFrames) break;
          
          const frameProgress = frameIndex / (definition.totalFrames - 1);
          const centerX = x * frameWidth + frameWidth / 2;
          const centerY = y * frameHeight + frameHeight / 2;
          const radius = Math.min(frameWidth, frameHeight) / 2;
          
          const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius * (0.5 + frameProgress * 0.5)
          );
          
          const colors = getCategoryColors(definition.category);
          const alpha = Math.max(0.1, 1.0 - frameProgress * 0.7);
          
          gradient.addColorStop(0, `rgba(${colors.inner.join(',')}, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(${colors.middle.join(',')}, ${alpha * 0.7})`);
          gradient.addColorStop(1, `rgba(${colors.outer.join(',')}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      
      // Add metadata
      texture.name = `${definition.name} (Demo)`;
      texture.spritesheetKey = key;
      texture.framesX = definition.framesX;
      texture.framesY = definition.framesY;
      texture.totalFrames = definition.totalFrames;
      texture.frameRate = definition.frameRate;
      texture.category = definition.category;
      texture.animationMode = definition.animationMode;
      texture.description = definition.description;
      
      demoSpritesheets.push(texture);
    }
    
    console.log('🔍 DEBUG - createDemoSpritesheets result:', demoSpritesheets);
    return demoSpritesheets;
  };

  const getCategoryColors = (category) => {
    const colorSchemes = {
      fire: { inner: [255, 255, 200], middle: [255, 120, 0], outer: [200, 50, 0] },
      smoke: { inner: [180, 180, 180], middle: [100, 100, 100], outer: [60, 60, 60] },
      magic: { inner: [255, 200, 255], middle: [150, 100, 255], outer: [100, 50, 200] },
      flame: { inner: [255, 255, 150], middle: [255, 100, 50], outer: [150, 50, 0] },
      electric: { inner: [200, 200, 255], middle: [100, 150, 255], outer: [50, 100, 200] },
      water: { inner: [200, 255, 255], middle: [100, 200, 255], outer: [50, 150, 200] },
      comic: { inner: [255, 255, 100], middle: [255, 200, 50], outer: [255, 100, 0] },
      explosion: { inner: [255, 200, 100], middle: [255, 100, 50], outer: [200, 50, 0] }
    };
    return colorSchemes[category] || colorSchemes.fire;
  };

  // Initialize spritesheets
  useEffect(() => {
    const initializeSpritesheets = async () => {
      setIsLoading(true);
      
      try {
        console.log('🔍 DEBUG - Initializing spritesheets...');
        
        // Load actual spritesheets first
        const actualSpritesheets = await loadActualSpritesheets();
        console.log('🔍 DEBUG - actualSpritesheets:', actualSpritesheets);
        
        // Create demos for missing spritesheets
        const demoSpritesheets = createDemoSpritesheets();
        console.log('🔍 DEBUG - demoSpritesheets:', demoSpritesheets);
        
        // Combine actual and demo spritesheets
        const allSpritesheets = [...actualSpritesheets, ...demoSpritesheets];
        console.log('🔍 DEBUG - allSpritesheets:', allSpritesheets);
        
        setSpritesheets(allSpritesheets);
        console.log(`🎬 Loaded ${allSpritesheets.length} spritesheets:`, {
          actual: actualSpritesheets.length,
          demo: demoSpritesheets.length,
          actualNames: actualSpritesheets.map(s => s.name),
          demoNames: demoSpritesheets.map(s => s.name)
        });
        
      } catch (error) {
        console.error('❌ Failed to initialize spritesheets:', error);
        // Fall back to demos only
        setSpritesheets(createDemoSpritesheets());
      } finally {
        setIsLoading(false);
      }
    };

    initializeSpritesheets();
  }, []);

  // Create options for UI selection
  const spritesheetOptions = useMemo(() => {
    const options = {};
    
    // Group by category
    const categories = [...new Set(spritesheets.map(s => s.category))].sort();
    
    categories.forEach(category => {
      options[`-- ${category.toUpperCase()} --`] = '';
      spritesheets
        .filter(s => s.category === category)
        .forEach(spritesheet => {
          options[spritesheet.name] = spritesheet.spritesheetKey;
        });
    });
    
    return options;
  }, [spritesheets]);

  // Get categories for filtering
  const spritesheetCategories = useMemo(() => {
    const categories = [...new Set(spritesheets.map(s => s.category))];
    return categories.sort();
  }, [spritesheets]);

  // Function to get spritesheet by name or key
  const getSpritesheetByName = (nameOrKey) => {
    const spritesheet = spritesheets.find(s => 
      s.name === nameOrKey || s.spritesheetKey === nameOrKey
    );
    return spritesheet || spritesheets[0];
  };

  // Function to get spritesheets by category
  const getSpritesheetsByCategory = (category) => {
    return spritesheets.filter(s => s.category === category);
  };

  // Get animation mode options
  const animationModeOptions = {
    'Play Once': 'once',
    'Loop': 'loop',
    'Ping-Pong': 'ping-pong'
  };

  // Utility function to get spritesheet metadata
  const getSpritesheetMetadata = (nameOrKey) => {
    const spritesheet = getSpritesheetByName(nameOrKey);
    if (!spritesheet) return null;
    
    return {
      name: spritesheet.name,
      framesX: spritesheet.framesX,
      framesY: spritesheet.framesY,
      totalFrames: spritesheet.totalFrames,
      frameRate: spritesheet.frameRate,
      animationMode: spritesheet.animationMode,
      category: spritesheet.category,
      description: spritesheet.description
    };
  };

  return {
    spritesheets,
    spritesheetOptions,
    getSpritesheetByName,
    getSpritesheetsByCategory,
    spritesheetCategories,
    animationModeOptions,
    getSpritesheetMetadata,
    isLoading,
    
    // Utility functions
    createDemoSpritesheets,
    definitions: spritesheetDefinitions
  };
};