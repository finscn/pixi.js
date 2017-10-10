export default `

uniform sampler2D uSampler;
varying vec2 vTextureCoord;
varying float vAlpha;

void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vAlpha;
}

`;
