export default `

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec4 filterArea;
// uniform vec4 filterClamp;

uniform vec2 uCenter;
uniform float uRadius;
uniform float uTime;
uniform float uDuration;

// Amplitude, Refraction, Wavelength, Lighter;
uniform vec4 uParams;

void main()
{
    float amplitude = uParams.x;
    float refraction = uParams.y;
    float wavelength = uParams.z;
    float lighter = uParams.w;

    float halfWavelength = wavelength * 0.5 / filterArea.x;
    float maxRadius = uRadius / filterArea.x;
    float speed = (maxRadius + halfWavelength) / uDuration;
    float currentRadius = uTime * speed;

    vec2 center = uCenter.xy / filterArea.xy;
    vec2 dir = vec2(center - vTextureCoord);
    dir.y *= filterArea.y / filterArea.x;

    float dist = length(dir);

    vec2 uv = vTextureCoord;

    if (dist >= maxRadius || dist <= (currentRadius - halfWavelength) || dist >= (currentRadius + halfWavelength))
    {
      gl_FragColor = texture2D(uSampler, uv);
      return;
    }

    float damping = 1.0 - dist / maxRadius;

    float wave = dist - currentRadius;
    float wavePow = 1.0 - pow(abs(wave * amplitude), refraction);
    float waveFinal = wave * wavePow;

    vec2 waveDir = normalize(dir);
    uv = uv + waveDir * waveFinal * damping;

    vec4 color = texture2D(uSampler, uv);

    // vec2 clampedCoord = clamp(uv, filterClamp.xy, filterClamp.zw);
    // vec4 color = texture2D(uSampler, clampedCoord);
    // if (uv != clampedCoord) {
    //     color *= max(0.0, 1.0 - length(uv - clampedCoord));
    // }

    gl_FragColor =  vec4(color.rgb * lighter, color.a);

}

`;
// uniform vec2 uViewSize;

// ...

// float timeRate = time / uDuration;

// ...

// vec2 texCoord = gl_FragCoord.xy / filterArea.xy;
// texCoord.y = 1.0 - texCoord.y;

// vec2 center = uCenter.xy / uViewSize.xy;
// float maxRadius = uRadius / uViewSize.x;

// float disFade = pow(1.0 - dist / maxRadius, 0.8);

// from -1.0 to 1.0
// wave = sin( PI * 0.5 * (dist - currentRadius));
// wave = sin(PI * dist * 0.5 - uTime * 1.0);

// vec2 vector = vec2(texCoord - center);
// vector.x *= uViewSize.x / uViewSize.x;

// float durationRate = pow(timeRate * 1.25, 0.8);
// float timeFade = pow(1.0 - timeRate ,0.8);

// if (dist < maxRadius && timeRate <= 1.0 && dist < durationRate)
// {
//     float disFade = pow(1.0-dist/maxRadius ,0.8);

//     float wave = sin(PI * 1.0 * dist/maxRadius - time * 20.0) * disFade * timeFade;
//     float wavePow;

//     // wave = (wave + 1.0) * 0.5 - 1.0;
//     // wavePow = wave * wave;

//     wavePow = 1.0 - pow(abs(wave), 0.5);

//     wave = wavePow * wave ;

//     dist = 1.0 + dist * uViewSize.y * 0.5;
//     float damping = 1.0;//(1.0 + 0.002 * dist * dist);
//     uv = uv - normalize(vector) * wave * disFade * timeFade;
// }
