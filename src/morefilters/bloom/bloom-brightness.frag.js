export default `

uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform sampler2D bloomTexture;
uniform float toneScale;

void main() {
    vec4 color = vec4(0.0);
    color  = texture2D(uSampler, vTextureCoord) * toneScale;
    color += texture2D(bloomTexture, vTextureCoord);
    gl_FragColor = color;
}

`;
