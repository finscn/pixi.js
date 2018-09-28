varying vec2 vTextureCoord;
uniform vec4 uClampFrame;
uniform vec4 uColor;
uniform float uColorMultiplier;

uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;
    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z
        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)
            discard;

    vec4 color = texture2D(uSampler, vTextureCoord);
    ${parseColor}
    gl_FragColor = color * uColor;
    gl_FragColor.rgb *= uColorMultiplier;
}
