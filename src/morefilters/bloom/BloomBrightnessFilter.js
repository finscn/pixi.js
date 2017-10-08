import * as core from '../../core';
import ExtractBrightnessFilter from './ExtractBrightnessFilter';
import BlurXFilter from '../../filters/blur/BlurXFilter';
import BlurYFilter from '../../filters/blur/BlurYFilter';

export default class BloomBrightnessFilter extends core.Filter
{

    constructor(sampleCount, minBright, toneScale)
    {
        const vertSrc = [
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

            'uniform sampler2D bloomTexture;',
            'uniform float toneScale;',

            'void main() {',
            '    vec4 color = vec4(0.0);',
            '    color  = texture2D(uSampler, vTextureCoord) * toneScale;',
            '    color += texture2D(bloomTexture, vTextureCoord);',
            '    gl_FragColor = color;',
            '}',
        ].join('\n');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this._quality = 0;

        this.sampleCount = sampleCount || 9;
        this.minBright = minBright || 0.2;
        this.toneScale = toneScale || 0.8;

        this.strength = 8;
        this.quality = 4;
        this.resolution = 1;

        this.extractBrightnessFilter = new ExtractBrightnessFilter(this.minBright);
        this.blurXFilter = new BlurXFilter(this.strength, this.quality, this.resolution, this.sampleCount);
        this.blurYFilter = new BlurYFilter(this.strength, this.quality, this.resolution, this.sampleCount);
    }

    apply(filterManager, input, output, clear, currentState)
    {
        const brightTarget = filterManager.getRenderTarget(true);

        this.extractBrightnessFilter.apply(filterManager, input, brightTarget, true, currentState);

        const blurTarget = filterManager.getRenderTarget(true);

        this.blurXFilter.apply(filterManager, brightTarget, blurTarget, true, currentState);
        this.blurYFilter.apply(filterManager, blurTarget, brightTarget, true, currentState);

        this.uniforms.toneScale = this.toneScale;
        this.uniforms.bloomTexture = brightTarget;
        filterManager.applyFilter(this, input, output, clear);

        filterManager.returnRenderTarget(brightTarget);
        filterManager.returnRenderTarget(blurTarget);
    }

}
