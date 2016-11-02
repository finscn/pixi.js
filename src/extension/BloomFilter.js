import * as core from '../core';
import BrightnessFilter from './BrightnessFilter';
import BlurFilter from '../filters/blur/BlurFilter';

export default class BloomFilter extends core.Filter
{

    constructor(sampleCount, minBright, toneScale)
    {

        const vertSrc =  [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat3 projectionMatrix;',
            'varying vec2 vTextureCoord;',

            'void main() {',
            '    vTextureCoord = aTextureCoord;',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
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

        this.sampleCount = sampleCount || 9;
        this.toneScale = toneScale || 0.8;
        this.minBright = minBright || 0.2;

        this.resolution = 1;
        this._quality = 0;
        this.quality = 4;
        this.strength = 8;

        this.brightnessFilter = new BrightnessFilter(this.minBright);
        this.blurFilter = new BlurFilter(this.strength, this.quality, this.resolution, this.sampleCount);
    }

    apply(filterManager, input, output, clear)
    {

        const brightTarget = filterManager.getRenderTarget(true);
        this.brightnessFilter.apply(filterManager, input, brightTarget, true);

        const blurTarget = filterManager.getRenderTarget(true);
        this.blurFilter.apply(filterManager, brightTarget, blurTarget, false);

        filterManager.returnRenderTarget(brightTarget);

        this.uniforms.toneScale = this.toneScale;
        this.uniforms.bloomTexture = blurTarget;
        filterManager.applyFilter(this, input, output, clear);

        filterManager.returnRenderTarget(blurTarget);
    }

}

