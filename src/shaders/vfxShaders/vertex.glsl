// Enhanced VFX Vertex Shader with Spritesheet Support - FINAL FIX
precision mediump float;

// === CUSTOM ATTRIBUTES ONLY (Three.js provides position, normal, uv automatically) ===
attribute float aSize;
attribute float aTimeMultiplier;
attribute float aHeightFactor;

// === CUSTOM UNIFORMS ONLY (Three.js built-ins are automatic) ===
uniform float uSize;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform vec3 uColorEnd;
uniform float uProgress;
uniform float uTime;
uniform float uStreakLength;
uniform float uTurbulence;
uniform vec3 uDirectionalForce;
uniform float uGravity;
uniform float uUseGradient;
uniform float uMotionBlur;

// === TRAIL UNIFORMS ===
uniform float uTrailEnabled;     // 0.0 = off, 1.0 = on
uniform float uTrailLength;      // trail length multiplier
uniform float uTrailDamping;     // damping applied to trail over lifetime

// === NEW SPRITESHEET UNIFORMS ===
uniform float uUseSpritesheet;
uniform float uTotalFrames;
uniform float uFrameRate;
uniform float uAnimationMode;
uniform float uRandomStartFrame;

// === TORNADO UNIFORMS ===
uniform float uTornadoEnabled;
uniform float uTornadoHeight;
uniform float uVerticalSpeed;
uniform float uRotationSpeed;
uniform float uVortexStrength;
uniform float uSpiralSpin;
uniform float uBaseDiameter;
uniform float uTopDiameter;
uniform float uHeightColorGradient;

// === VARYING OUTPUTS ===
varying vec3 vColor;
varying float vAlpha;
varying float vLifetime;      // NEW: Particle lifetime for spritesheet animation
varying float vRandomSeed;    // NEW: Random seed per particle
varying vec2 vUv;
varying vec2 vVelocity;

// === UTILITY FUNCTIONS ===

/**
 * Generate pseudo-random number from position
 */
float random(vec3 pos) {
    return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

/**
 * 3D noise function for turbulence - FIXED variable naming
 */
float noise3D(vec3 pos) {
    vec3 i = floor(pos);
    vec3 frac = fract(pos);
    frac = frac * frac * (3.0 - 2.0 * frac);
    
    float a = random(i);
    float b = random(i + vec3(1.0, 0.0, 0.0));
    float c = random(i + vec3(0.0, 1.0, 0.0));
    float d = random(i + vec3(1.0, 1.0, 0.0));
    float e = random(i + vec3(0.0, 0.0, 1.0));
    float f_z1 = random(i + vec3(1.0, 0.0, 1.0));
    float g = random(i + vec3(0.0, 1.0, 1.0));
    float h = random(i + vec3(1.0, 1.0, 1.0));
    
    return mix(mix(mix(a, b, frac.x), mix(c, d, frac.x), frac.y),
               mix(mix(e, f_z1, frac.x), mix(g, h, frac.x), frac.y), frac.z);
}

/**
 * Calculate tornado motion effects
 */
vec3 applyTornadoMotion(vec3 pos, float progress, float heightFactor) {
    if (uTornadoEnabled < 0.5) return pos;
    
    // Calculate rotation based on height and time
    float rotationAngle = heightFactor * uSpiralSpin + uTime * uRotationSpeed;
    
    // Apply vortex strength - stronger at bottom, weaker at top
    float vortexInfluence = (1.0 - heightFactor) * uVortexStrength;
    
    // Rotate particle position
    float cosAngle = cos(rotationAngle);
    float sinAngle = sin(rotationAngle);
    
    vec3 tornadoPos = pos;
    tornadoPos.x = pos.x * cosAngle - pos.z * sinAngle;
    tornadoPos.z = pos.x * sinAngle + pos.z * cosAngle;
    
    // Apply vertical motion
    tornadoPos.y += progress * uVerticalSpeed * heightFactor;
    
    // Add some radial expansion based on height
    float radiusExpansion = mix(uBaseDiameter, uTopDiameter, heightFactor);
    tornadoPos.x *= radiusExpansion;
    tornadoPos.z *= radiusExpansion;
    
    // Apply vortex pulling effect
    vec2 radialDirection = normalize(tornadoPos.xz);
    tornadoPos.xz += radialDirection * vortexInfluence * sin(uTime * 2.0 + heightFactor * 10.0) * 0.1;
    
    return tornadoPos;
}

void main() {
    // === BASIC SETUP ===
    // Use built-in 'position' attribute (provided by Three.js)
    vec3 pos = position;
    float particleProgress = uProgress * aTimeMultiplier;
    
    // Generate random seed for this particle
    vRandomSeed = random(position);
    
    // === CALCULATE PARTICLE LIFETIME ===
    // For spritesheet animation, we need normalized lifetime (0.0 to 1.0)
    vLifetime = clamp(particleProgress, 0.0, 1.0);
    
    // === PHYSICS SIMULATION ===
    if (particleProgress > 0.0) {
        float t = particleProgress;
        float t2 = t * t;
        
        // Apply gravity
        pos.y += uGravity * t2 * 0.5;
        
        // Apply directional forces
        pos += uDirectionalForce * t;
        
        // Apply turbulence using 3D noise
        if (uTurbulence > 0.0) {
            vec3 turbulenceOffset = vec3(
                noise3D(position * 2.0 + uTime),
                noise3D(position * 2.0 + uTime + 100.0),
                noise3D(position * 2.0 + uTime + 200.0)
            ) - 0.5;
            pos += turbulenceOffset * uTurbulence * t;
        }
        
        // Apply tornado motion if enabled
        pos = applyTornadoMotion(pos, particleProgress, aHeightFactor);
        
        // Apply motion blur streaking
        if (uMotionBlur > 0.5 && uStreakLength > 0.0) {
            vec3 velocity = uDirectionalForce + vec3(0.0, uGravity * t, 0.0);
            pos += velocity * uStreakLength * vRandomSeed;
        }

        // Compute a simple velocity approximation for trailing in fragment shader
        vec3 approxVelocity = uDirectionalForce + vec3(0.0, uGravity * t, 0.0);
        if (uTornadoEnabled > 0.5) {
            float rot = aHeightFactor * uSpiralSpin + uTime * uRotationSpeed;
            approxVelocity.x += -sin(rot) * 0.5 * uVortexStrength;
            approxVelocity.z += cos(rot) * 0.5 * uVortexStrength;
        }
        vVelocity = approxVelocity.xz;
    }
    
    // === COLOR CALCULATION ===
    if (uUseGradient > 0.5) {
        vColor = mix(uColor, uColorEnd, particleProgress);
    } else {
        vColor = uColor;
    }
    
    // === ALPHA CALCULATION ===
    // Base alpha with fade-in and fade-out
    float fadeIn = smoothstep(0.0, 0.1, particleProgress);
    float fadeOut = 1.0 - smoothstep(0.8, 1.0, particleProgress);
    vAlpha = fadeIn * fadeOut;
    
    // Apply size-based alpha variation
    vAlpha *= smoothstep(0.1, 1.0, aSize);
    
    // === SPRITESHEET-SPECIFIC ADJUSTMENTS ===
    if (uUseSpritesheet > 0.5) {
        // Enhance alpha for animated particles
        float animationIntensity = 1.0 + sin(vLifetime * 3.14159) * 0.2;
        vAlpha *= animationIntensity;
        
        // Add random lifetime variation for more organic animation
        if (uRandomStartFrame > 0.5) {
            float randomOffset = vRandomSeed * 0.3;
            vLifetime = clamp(vLifetime + randomOffset, 0.0, 1.0);
        }
    }
    
    // === SIZE CALCULATION ===
    float finalSize = uSize * aSize;
    
    // Size variation based on progress for natural particle growth/shrink
    if (particleProgress > 0.0) {
        float sizeMultiplier = 1.0 + sin(particleProgress * 3.14159) * 0.5;
        finalSize *= sizeMultiplier;
    }
    
    // === TRANSFORM TO SCREEN SPACE ===
    // Use built-in matrices (provided by Three.js)
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // === POINT SIZE CALCULATION ===
    // Calculate size in screen space
    float distance = length(viewPosition.xyz);
    gl_PointSize = finalSize * uResolution.y / distance;
    
    // Clamp size to reasonable limits
    gl_PointSize = clamp(gl_PointSize, 1.0, 512.0);
}