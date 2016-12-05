import * as core from '../../../core';

export default class ExtractBrightnessFilter extends core.Filter
{

    constructor(minBright)
    {
        const vertSrc =  [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat3 projectionMatrix;',
            'varying vec2 vTextureCoord;',

            'void main() {',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '    vTextureCoord = aTextureCoord;',
            '}',
        ].join('\n');

        const fragSrc = [
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',

            'uniform float minBright;',

            'void main() {',
            '    vec4 textureColor = texture2D(uSampler, vTextureCoord);',
            '    vec3 color = max(vec3(0.0), textureColor.rgb - minBright);',
            '    gl_FragColor = vec4(color, textureColor.a);',
            '}',
        ].join('\n');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.minBright = minBright;

    }
}

