varying vec2 vTextureCoord;
uniform vec4 uColor;
uniform float uColorMultiplier;

uniform sampler2D uSampler;

void main(void)
{
    vec4 color = texture2D(uSampler, vTextureCoord);
    ${parseColor}
    gl_FragColor = color * uColor;
    gl_FragColor.rgb *= uColorMultiplier;
}
