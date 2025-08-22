// Enhanced VFX Fragment Shader with Spritesheet Support
precision mediump float;

// === EXISTING UNIFORMS ===
uniform sampler2D uTexture;
uniform vec3 uColor;
uniform vec3 uColorEnd;
uniform float uProgress;
uniform float uTime;
uniform float uUseGradient;
uniform float uOpacity;

// === NEW SPRITESHEET UNIFORMS ===
uniform float uUseSpritesheet;      // 0.0 = static texture, 1.0 = animated spritesheet
uniform float uFramesX;             // Number of frames horizontally
uniform float uFramesY;             // Number of frames vertically
uniform float uTotalFrames;         // Total number of frames in animation
uniform float uFrameRate;           // Frames per second
uniform float uAnimationMode;       // 0.0 = once, 1.0 = loop, 2.0 = ping-pong
uniform float uRandomStartFrame;    // 0.0 = synchronized, 1.0 = random start frames

// === TRAIL UNIFORMS ===
uniform float uTrailEnabled;    // 0.0 = off, 1.0 = on
uniform float uTrailLength;     // how many samples to blend for the trail
uniform float uTrailDamping;    // per-sample damping multiplier
uniform float uTrailSize;       // base offset multiplier for trail sampling

// === EXISTING TORNADO UNIFORMS ===
uniform float uTornadoEnabled;
uniform float uTornadoHeight;
uniform float uVerticalSpeed;
uniform float uRotationSpeed;
uniform float uVortexStrength;
uniform float uSpiralSpin;
uniform float uBaseDiameter;
uniform float uTopDiameter;
uniform float uHeightColorGradient;

// === VARYING INPUTS ===
varying vec3 vColor;
varying float vAlpha;
varying vec2 vUv;
varying float vLifetime;      // Particle lifetime (0.0 to 1.0)
varying float vRandomSeed;    // Random seed per particle
varying vec2 vVelocity;

// === SPRITESHEET FUNCTIONS ===

/**
 * Calculate current frame number based on animation progress and mode
 */
float calculateFrame(float progress, float randomSeed) {
    // Simplify frame calculation for better discrete stepping
    float totalProgress = progress;
    
    // Apply random start frame offset if enabled
    if (uRandomStartFrame > 0.5) {
        totalProgress += randomSeed;
        totalProgress = mod(totalProgress, 1.0); // Keep in 0-1 range
    }
    
    // Calculate raw frame position
    float rawFrame = totalProgress * uTotalFrames;
    
    // Handle different animation modes with DISCRETE frame stepping
    if (uAnimationMode < 0.5) {
        // Mode 0: Play once
        return floor(clamp(rawFrame, 0.0, uTotalFrames - 1.0));
    } 
    else if (uAnimationMode < 1.5) {
        // Mode 1: Loop
        return floor(mod(rawFrame, uTotalFrames));
    } 
    else {
        // Mode 2: Ping-pong
        float cycle = rawFrame / uTotalFrames;
        float pingPongFrame = mod(cycle, 2.0);
        if (pingPongFrame > 1.0) {
            // Reverse direction
            return floor(uTotalFrames - 1.0 - mod(rawFrame, uTotalFrames));
        } else {
            return floor(mod(rawFrame, uTotalFrames));
        }
    }
}

/**
 * Calculate UV coordinates for spritesheet frame
 */
vec2 getSpritesheetUV(vec2 baseUV, float frameNumber) {
    // Calculate frame position in grid
    float frameX = mod(frameNumber, uFramesX);
    float frameY = floor(frameNumber / uFramesX);
    
    // Calculate frame size
    vec2 frameSize = vec2(1.0 / uFramesX, 1.0 / uFramesY);
    
    // Calculate offset for this frame
    vec2 frameOffset = vec2(frameX, frameY) * frameSize;
    
    // Scale base UV to frame size and add offset
    vec2 spriteUV = baseUV * frameSize + frameOffset;
    
    // FIXED: Flip Y coordinate for proper spritesheet layout
    // spriteUV.y = 1.0 - spriteUV.y;
    
    return spriteUV;
}

/**
 * Enhanced color mixing with tornado height gradient support
 */
vec3 calculateFinalColor(vec3 baseColor, float progress, float heightFactor) {
    vec3 finalColor = baseColor;
    
    // Apply gradient if enabled
    if (uUseGradient > 0.5) {
        finalColor = mix(uColor, uColorEnd, progress);
    }
    
    // Apply tornado height color gradient if enabled
    if (uTornadoEnabled > 0.5 && uHeightColorGradient > 0.5) {
        // Create height-based color variation
        vec3 bottomColor = uColor;
        vec3 topColor = uColorEnd;
        finalColor = mix(bottomColor, topColor, heightFactor);
        
        // Add some intensity variation based on vortex strength
        float intensityMultiplier = 1.0 + (uVortexStrength - 1.0) * 0.3;
        finalColor *= intensityMultiplier;
    }
    
    return finalColor;
}

void main() {
    // Use gl_PointCoord for point sprite UV coordinates
    vec2 finalUV = gl_PointCoord;
    
    // === SPRITESHEET UV CALCULATION ===
    if (uUseSpritesheet > 0.5) {
        // Calculate current frame based on particle lifetime
        float currentFrame = calculateFrame(vLifetime, vRandomSeed);
        
        // Get UV coordinates for the current frame
        finalUV = getSpritesheetUV(gl_PointCoord, currentFrame);
    }
    
    // === TEXTURE SAMPLING ===
    vec4 textureColor = vec4(0.0);
    if (uTrailEnabled > 0.5) {
        // Blend several samples along the velocity vector to approximate a trail
        float samples = max(1.0, floor(uTrailLength));
        float inv = 1.0 / samples;
        vec2 vel = normalize(vVelocity + vec2(0.0001));
        float totalWeight = 0.0;
        for (float i = 0.0; i < 16.0; i++) { // upper bound loop - GLSL requires const loop
            if (i >= samples) break;
            float t = i * inv;
            float weight = pow(1.0 - t, uTrailDamping + 0.1);
            vec2 sampleUV = finalUV + vel * t * uTrailLength * uTrailSize;
            textureColor += texture2D(uTexture, sampleUV) * weight;
            totalWeight += weight;
        }
        textureColor /= max(0.0001, totalWeight);
    } else {
        textureColor = texture2D(uTexture, finalUV);
    }
    
    // === COLOR CALCULATION ===
    vec3 finalColor = calculateFinalColor(vColor, vLifetime, vRandomSeed);
    
    // === ALPHA CALCULATION ===
    float finalAlpha = textureColor.a * vAlpha * uOpacity;
    
    // Enhance alpha falloff for better particle edges
    finalAlpha *= smoothstep(0.0, 0.1, textureColor.a);
    
    // === TORNADO-SPECIFIC ENHANCEMENTS ===
    if (uTornadoEnabled > 0.5) {
        // Add some turbulence-based alpha variation
        float turbulenceAlpha = 1.0 - (vRandomSeed * 0.2);
        finalAlpha *= turbulenceAlpha;
        
        // Fade particles at the edges of the tornado
        float edgeFade = 1.0 - smoothstep(0.8, 1.0, distance(vUv, vec2(0.5)));
        finalAlpha *= edgeFade;
    }
    
    // === SPRITESHEET-SPECIFIC ENHANCEMENTS ===
    if (uUseSpritesheet > 0.5) {
        // Add frame-based intensity variation for more dynamic animation
        float currentFrame = calculateFrame(vLifetime, vRandomSeed);
        float frameIntensity = 1.0 + sin(currentFrame * 0.5) * 0.1;
        finalColor *= frameIntensity;
        
        // Apply animation-specific alpha adjustments
        if (uAnimationMode < 0.5) {
            // "Once" mode: fade out at end
            float endFade = 1.0 - smoothstep(0.8, 1.0, vLifetime);
            finalAlpha *= endFade;
        }
    }
    
    // === FINAL OUTPUT ===
    gl_FragColor = vec4(finalColor * textureColor.rgb, finalAlpha);
    
    // Debug: Uncomment to visualize frame numbers
    // if (uUseSpritesheet > 0.5) {
    //     float currentFrame = calculateFrame(vLifetime, vRandomSeed);
    //     gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(currentFrame / uTotalFrames, 0.0, 1.0), 0.3);
    // }
}