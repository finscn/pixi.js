varying vec2 vTextureCoord;
uniform vec4 uClampFrame;
uniform vec4 uColor;
uniform float uTintScale;

uniform sampler2D uSampler;

void main(void)
{
    vec2 coord = vTextureCoord;
    if (coord.x < uClampFrame.x || coord.x > uClampFrame.z
        || coord.y < uClampFrame.y || coord.y > uClampFrame.w)
            discard;

    uColor.rgb *= uTintScale;
    gl_FragColor = texture2D(uSampler, coord) * uColor;
}
