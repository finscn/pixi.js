varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 uViewSize;
uniform vec2 uFrameSize;
uniform float uTime;
uniform vec2 uStartPos;
uniform vec2 uPos;

void main()
{
    uTime;

    vec4 color = texture2D(uSampler, vTextureCoord);

    if (color.a > 0.99) {
        gl_FragColor = color;
        return;
    }

    float aspect = uViewSize.x / uViewSize.y;

    vec2 fragCoord = gl_FragCoord.xy / uViewSize;
    fragCoord.y = 1.0 - fragCoord.y;
    fragCoord.x *= aspect;

    vec2 uv = vTextureCoord;

    vec2 startPos = uStartPos / uFrameSize;
    vec2 pos = uPos / uFrameSize;
    vec2 offsetPos = pos - startPos;

    const int step = 10;

    vec2 disStep = offsetPos / float(step);
    vec4 dColor = vec4(0.0, 0.0, 0.0, 0.0);

    float time = uTime / 200.0;
    float timeStep = 3.14 / float(step);
    for (int i = 0; i < step; i++) {
        vec2 _uv = uv + offsetPos + vec2(sin(time) / 50.0, cos(time) / 50.0);
        vec4 stepColor = texture2D(uSampler, _uv);
        dColor += stepColor * 0.2;
        offsetPos -= disStep;
        time += timeStep;
    }

    gl_FragColor = dColor + color;
}
