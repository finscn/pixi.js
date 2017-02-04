varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uViewSize;
uniform vec2 uCenter;
uniform float uStrength;
uniform float uRadius;
uniform float uMinRadius;


float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    uRadius;
    uMinRadius;

    vec2 texCoord = gl_FragCoord.xy / uViewSize.xy;
    texCoord.y = 1.0 - texCoord.y;

    vec2 center = uCenter.xy / uViewSize.xy;
    vec2 dir = vec2(center - texCoord);
    dir.x *= uViewSize.x / uViewSize.y;

    float strength = uStrength;

    /* randomize the lookup values to hide the fixed number of samples */
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

    const float count = 32.0;
    const float gap = 16.0;
    float countLimit = count;

    float dist = length(dir);
    float radius = (uRadius - gap) / uViewSize.y;
    float minRadius = (uMinRadius + gap) / uViewSize.y;

    if (dist <  minRadius) {
        float normalCount = count / uViewSize.y;
        float delta = minRadius - dist;
        delta = (normalCount - delta) / normalCount;
        countLimit *= delta;
        // strength *= delta;
    } else if (dist > radius) {
        float normalCount = count / uViewSize.y;
        float delta = dist - radius;
        delta = (normalCount - delta) / normalCount;
        countLimit *= delta;
        // strength *= delta;
    }

    dir *= strength;

    vec4 color = vec4(0.0);
    float total = 0.0;

    for (float t = 0.0; t < count; t++) {
        float percent = (t + offset) / count;
        float weight = 4.0 * (percent - percent * percent);
        vec2 p = vTextureCoord + dir * percent;
        vec4 sample = texture2D(uSampler, p);

        /* switch to pre-multiplied alpha to correctly blur transparent images */
        sample.rgb *= sample.a;

        color += sample * weight;
        total += weight;
        if (t > countLimit){
            break;
        }
    }

    gl_FragColor = color / total;

    /* switch back from pre-multiplied alpha */
    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}
