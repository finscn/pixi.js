varying vec2 vTextureCoord;
uniform vec4 uColor;
uniform float uTintScale;

uniform sampler2D uSampler;

void main(void)
{
    uColor.rgb *= uTintScale;
    gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;
}
