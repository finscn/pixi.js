export default `

uniform mat3 projectionMatrix;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

uniform sampler2D uStatusOut0;
attribute vec2 aParticleIndex;

uniform vec2 uPosition;


// attribute vec4 aParticleFrame;

// uniform vec2 uParticleFrameSize;
// attribute vec2 aParticleFrameOffset;

void main(void){

    vec4 state;

    state = texture2D(uStatusOut0, aParticleIndex);

    vec2 position = state.xy;

    vec2 v = aVertexPosition + position + uPosition;

    gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);

    vTextureCoord = aTextureCoord;

    // vTextureCoord = aParticleFrame.xy + aTextureCoord * aParticleFrame.zw;
    // vTextureCoord = aParticleFrameOffset.xy + aTextureCoord * uParticleFrameSize.xy;
}

`;
