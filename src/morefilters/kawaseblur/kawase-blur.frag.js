export default `

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

uniform vec2 pixelSize;
uniform float offset;

void main(void)
{
    vec2 dUV = (pixelSize * vec2(offset, offset)) + pixelSize * 0.5;

    // Sample top left pixel
    vec2 sampleCoord;
    sampleCoord.x = vTextureCoord.x - dUV.x;
    sampleCoord.y = vTextureCoord.y + dUV.y;

    vec4 color = texture2D(uSampler, sampleCoord);

    // Sample top right pixel
    sampleCoord.x = vTextureCoord.x + dUV.x;
    sampleCoord.y = vTextureCoord.y + dUV.y;
    color += texture2D(uSampler, sampleCoord);

    // Sample bottom right pixel
    sampleCoord.x = vTextureCoord.x + dUV.x;
    sampleCoord.y = vTextureCoord.y - dUV.y;
    color += texture2D(uSampler, sampleCoord);

    // Sample bottom left pixel
    sampleCoord.x = vTextureCoord.x - dUV.x;
    sampleCoord.y = vTextureCoord.y - dUV.y;
    color += texture2D(uSampler, sampleCoord);

    // Average
    gl_FragColor = color * 0.25;
}

`;
