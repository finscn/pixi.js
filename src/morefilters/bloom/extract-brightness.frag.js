export default `

uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform float minBright;

void main() {
    vec4 textureColor = texture2D(uSampler, vTextureCoord);
    vec3 color = max(vec3(0.0), textureColor.rgb - minBright);
    gl_FragColor = vec4(color, textureColor.a);
}

`;
