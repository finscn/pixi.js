export default `

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uViewSize;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uTime;
uniform float uDuration;

// Amplitude Effect, Refraction, Width, Lighter;
uniform vec4 uParams;

// non-loop
float time = uTime;
// loop
// float time = mod(uTime, uDuration);

float timeRate = time / uDuration;

float amplitude = uParams.x;
float refraction = uParams.y;
float waveWidth = uParams.z * 0.5 / uViewSize.y;
float lighter = uParams.w;

float speed = (uRadius + uParams.z) / uDuration;
float currentRadius = time * speed / uViewSize.y;

void main()
{
    vec2 texCoord = gl_FragCoord.xy / uViewSize.xy;
    texCoord.y = 1.0 - texCoord.y;

    vec2 uv = vTextureCoord;

    vec2 center = uCenter.xy / uViewSize.xy;
    float radius = uRadius / uViewSize.y;

    vec2 dir = vec2(texCoord - center);
    dir.x *= uViewSize.x / uViewSize.y;

    float dist = length(dir);

    if (dist > radius || dist < (currentRadius - waveWidth) || dist > (currentRadius + waveWidth))
    {
        gl_FragColor = texture2D(uSampler, uv);
        return;
    }

    // float disFade = pow(1.0 - dist / radius, 0.8);
    float disFade = 1.0 - dist / radius;

    // from -1.0 to 1.0
    float wave = (dist - currentRadius);
    // wave = sin( PI * 0.5 * (dist - currentRadius));
    // wave = sin(PI * dist * 0.5 - time * 1.0);

    float wavePow = 1.0 - pow(abs(wave * amplitude), refraction);

    float waveFinal = wave * wavePow;

    vec2 waveDir = normalize(dir);
    uv = uv + (waveDir * waveFinal) * disFade ;// * timeFade;
    vec4 color = texture2D(uSampler, uv);

    float light = ( lighter - 1.0) *  disFade + 1.0;

    gl_FragColor =  vec4(color.rgb * light, color.a);

}


    // float disFade = pow(1.0 - dist / radius, 0.8);

    // vec2 center = uCenter.xy / uViewSize.xy;
    // float radius = uRadius / uViewSize.y;

    // vec2 vector = vec2(texCoord - center);
    // vector.x *= uViewSize.x / uViewSize.y;



// float durationRate = pow(timeRate * 1.25, 0.8);
// float timeFade = pow(1.0 - timeRate ,0.8);

// if (dist < radius && timeRate <= 1.0 && dist < durationRate)
// {
//     float disFade = pow(1.0-dist/radius ,0.8);


//     float wave = sin(PI * 1.0 * dist/radius - time * 20.0) * disFade * timeFade;
//     float wavePow;

//     // wave = (wave + 1.0) * 0.5 - 1.0;
//     // wavePow = wave * wave;

//     wavePow = 1.0 - pow(abs(wave), 0.5);

//     wave = wavePow * wave ;

//     dist = 1.0 + dist * uViewSize.y * 0.5;
//     float damping = 1.0;//(1.0 + 0.002 * dist * dist);
//     uv = uv - normalize(vector) * wave * disFade * timeFade;
// }

`;
