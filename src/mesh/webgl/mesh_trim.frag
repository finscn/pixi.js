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

    gl_FragColor = texture2D(uSampler, coord) * uColor;
    gl_FragColor.rgb *= uColorMultiplier;
}
