uniform sampler2D uTexture;
uniform vec3 uColor;
uniform vec3 uColorEnd;
uniform float uUseGradient;
uniform float uProgress;
uniform float uMotionBlur;
uniform float uTime;
uniform float uOpacity;

void main()
{
    vec2 uv = gl_PointCoord;
    vec4 finalTexture = vec4(0.0);
    
    // Enhanced motion blur effect
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
    
    // Calculate gradient color based on progress
    vec3 finalColor = uColor;
    if (uUseGradient > 0.5) {
        // Use the particle's life progress for gradient
        float gradientProgress = clamp(uProgress, 0.0, 1.0);
        finalColor = mix(uColor, uColorEnd, gradientProgress);
    }

    // Apply motion blur to alpha as well for more dramatic effect
    if (uMotionBlur > 0.5) {
        textureAlpha *= (1.0 + uMotionBlur * 0.5);
    }

    float finalAlpha = textureAlpha * uOpacity;
    // Final color
    gl_FragColor = vec4(finalColor, finalAlpha);
}