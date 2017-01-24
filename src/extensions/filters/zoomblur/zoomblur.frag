varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uViewSize;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uStrength;


float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    uRadius;

    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 toCenter = uCenter - vTextureCoord * uViewSize;

    /* randomize the lookup values to hide the fixed number of samples */
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

    for (float t = 0.0; t <= 40.0; t++) {
        float percent = (t + offset) / 40.0;
        float weight = 4.0 * (percent - percent * percent);
        vec4 sample = texture2D(uSampler, vTextureCoord + toCenter * percent * uStrength / uViewSize);

        /* switch to pre-multiplied alpha to correctly blur transparent images */
        sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;
    }

    gl_FragColor = color / total;

    /* switch back from pre-multiplied alpha */
    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}
