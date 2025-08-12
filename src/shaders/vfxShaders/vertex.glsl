uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uTime;
uniform vec3 uDirectionalForce;
uniform float uTurbulence;
uniform float uStreakLength;
uniform float uGravity;

attribute float aSize;
attribute float aTimeMultiplier;

varying vec2 vUv;
varying float vProgress;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

// Simple noise function
float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void main()
{
    float progress = uProgress * aTimeMultiplier;
    vProgress = progress;
    vec3 newPosition = position;

    // Apply directional forces
    newPosition += uDirectionalForce * progress;

    // Apply gravity force - affects Y position over time
    if (uGravity != 0.0) {
        // Use physics equation: y = y0 + v0*t + 0.5*g*t^2
        // For particle effects, we use progress as normalized time (0-1)
        float gravityTime = progress * 2.0; // Scale time for more dramatic effect
        float gravityEffect = uGravity * gravityTime * gravityTime * 0.5;
        newPosition.y += gravityEffect;
    }

    // Apply turbulence/noise
    if (uTurbulence > 0.0) {
        vec3 noiseInput = position + uTime * 0.5;
        vec3 noiseOffset = vec3(
            noise(noiseInput) - 0.5,
            noise(noiseInput + vec3(123.0)) - 0.5,
            noise(noiseInput + vec3(456.0)) - 0.5
        );
        newPosition += noiseOffset * uTurbulence * progress;
    }

    // Enhanced streak/trail effect - much more visible
    vec3 velocity = uDirectionalForce;
    float velocityMagnitude = length(velocity);
    
    if (uStreakLength > 0.01) {
        // Create dramatic streak effect regardless of velocity
        float streakProgress = progress * uStreakLength;
        
        // Apply stretching effect by modifying position along movement direction
        if (velocityMagnitude > 0.01) {
            vec3 velocityDirection = normalize(velocity);
            // Stretch particles dramatically in movement direction
            newPosition += velocityDirection * streakProgress * 2.0;
        } else {
            // If no velocity, create vertical streaks (affected by gravity)
            vec3 gravityDirection = vec3(0.0, -1.0, 0.0);
            if (uGravity > 0.0) {
                // Streaks follow gravity direction
                newPosition += gravityDirection * streakProgress * 2.0;
            } else {
                // Default vertical streaks
                newPosition.y += streakProgress * 2.0;
            }
        }
        
        // Also affect the falling behavior to create trail effect
        float trailOffset = sin(progress * 12.0 + uTime * 8.0) * uStreakLength * 0.3;
        newPosition.x += trailOffset;
        newPosition.z += trailOffset * 0.5;
    }

    // Exploding
    float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
    explodingProgress = clamp(explodingProgress, 0.0, 1.0);
    explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
    newPosition *= explodingProgress;

    // Falling (enhanced with gravity consideration)
    float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
    fallingProgress = clamp(fallingProgress, 0.0, 1.0);
    fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
    
    // Combine traditional falling with gravity
    if (uGravity == 0.0) {
        // Traditional falling effect when no gravity
        newPosition.z -= fallingProgress * 0.15;
    }
    // When gravity is active, let gravity handle the falling motion

    // Scaling
    float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
    float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
    float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
    sizeProgress = clamp(sizeProgress, 0.0, 1.0);

    // Twinkling
    float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
    twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
    float sizeTwinkling = sin(progress * 30.0) * 0.4 + 0.6;
    sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    // Final size - dramatically enhanced streak length effect
    float streakSizeMultiplier = 1.0;
    if (uStreakLength > 0.01) {
        // Make streaks much more visible by dramatically increasing size
        streakSizeMultiplier = 1.0 + (uStreakLength * progress * 5.0);
    }
    
    gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling * streakSizeMultiplier;
    gl_PointSize *= 1.0 / - viewPosition.z;
    
    if(gl_PointSize < 1.0)
        gl_Position = vec4(9999.9);
}