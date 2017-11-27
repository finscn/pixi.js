export default `

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform float alpha;
uniform vec3 tint;

uniform vec2 viewSize;
uniform float worldTime;

void main(void)
{
    worldTime;

    float aspect = viewSize.x / viewSize.y;

    vec2 fragCoord = gl_FragCoord.xy / viewSize;
    fragCoord.y = 1.0 - fragCoord.y;
    fragCoord.x *= aspect;

    gl_FragColor = texture2D(uSampler, vTextureCoord) * vec4(tint * alpha, alpha);
}

`;
