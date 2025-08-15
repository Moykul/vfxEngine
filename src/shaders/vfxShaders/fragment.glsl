uniform sampler2D uTexture;
uniform vec3 uColor;
uniform vec3 uColorEnd;
uniform float uUseGradient;
uniform float uProgress;
uniform float uMotionBlur;
uniform float uTime;
uniform float uOpacity;

// === NEW TORNADO UNIFORMS ===
uniform float uTornadoEnabled;
uniform float uHeightColorGradient;

// === NEW VARYING FROM VERTEX ===
varying float vHeightFactor;


void main()
{
    vec2 uv = gl_PointCoord;
    vec4 finalTexture = vec4(0.0);
    
    // === EXISTING MOTION BLUR (works for both modes) ===
    if (uMotionBlur > 0.5) {
        // Create motion blur by sampling multiple points with varying intensities
        float blurStrength = uMotionBlur * uProgress * 0.3;
        int samples = 8;
        float totalWeight = 0.0;
        
        for (int i = 0; i < 8; i++) {
            float offset = float(i) / 7.0 - 0.5; // -0.5 to 0.5
            vec2 blurOffset = vec2(
                cos(uTime * 2.0 + uProgress * 6.28) * blurStrength * offset,
                sin(uTime * 2.0 + uProgress * 6.28) * blurStrength * offset
            );
            
            float weight = 1.0 - abs(offset);
            finalTexture += texture(uTexture, uv + blurOffset) * weight;
            totalWeight += weight;
        }
        
        finalTexture /= totalWeight;
    } else {
        // No motion blur - standard texture sampling
        finalTexture = texture(uTexture, uv);
    }
    
    float textureAlpha = finalTexture.r;
    
    // === COLOR CALCULATION ===
    vec3 finalColor = uColor;
    
    if (uTornadoEnabled > 0.5) {
        // === TORNADO COLOR MODE ===
        
        if (uHeightColorGradient > 0.5) {
            // Height-based gradient for tornado
            finalColor = mix(uColor, uColorEnd, vHeightFactor);
            
            // Add brightness variation based on height (brighter at top)
            float heightBrightness = 0.8 + vHeightFactor * 0.4;
            finalColor *= heightBrightness;
        } else if (uUseGradient > 0.5) {
            // Use progress-based gradient if height gradient is disabled
            float gradientProgress = clamp(uProgress, 0.0, 1.0);
            finalColor = mix(uColor, uColorEnd, gradientProgress);
        }
        
        // === TORNADO SWIRL EFFECT ===
        // Add dynamic swirl pattern based on particle position
        vec2 center = gl_PointCoord - 0.5;
        float distanceFromCenter = length(center);
        float swirlAngle = atan(center.y, center.x) + vHeightFactor * 6.28318; // 2*PI
        float swirlIntensity = sin(swirlAngle * 3.0 + uTime * 2.0) * 0.1 + 0.9;
        finalColor *= swirlIntensity;
        
        // === TORNADO ALPHA EFFECTS ===
        // Fade particles at the very top of tornado
        if (vHeightFactor > 0.85) {
            float fadeStart = 0.85;
            float fadeRange = 1.0 - fadeStart;
            float fadeProgress = (vHeightFactor - fadeStart) / fadeRange;
            textureAlpha *= (1.0 - fadeProgress * 0.5); // Subtle fade, don't disappear completely
        }
        
    } else {
        // === EXISTING GRADIENT MODE ===
        if (uUseGradient > 0.5) {
            // Use the particle's life progress for gradient
            float gradientProgress = clamp(uProgress, 0.0, 1.0);
            finalColor = mix(uColor, uColorEnd, gradientProgress);
        }
    }

    // === EXISTING MOTION BLUR ALPHA ENHANCEMENT ===
    if (uMotionBlur > 0.5) {
        textureAlpha *= (1.0 + uMotionBlur * 0.5);
    }

    float finalAlpha = textureAlpha * uOpacity;
    
    // Final color
    gl_FragColor = vec4(finalColor, finalAlpha);
}