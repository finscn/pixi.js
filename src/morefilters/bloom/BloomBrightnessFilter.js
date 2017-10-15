import * as core from '../../core';
import ExtractBrightnessFilter from './ExtractBrightnessFilter';
import BlurXFilter from '../../filters/blur/BlurXFilter';
import BlurYFilter from '../../filters/blur/BlurYFilter';

import vertex from './bloom-brightness.vert.js';
import fragment from './bloom-brightness.frag.js';

export default class BloomBrightnessFilter extends core.Filter
{
    constructor(toneScale, minBright, strength, quality, resolution, kernelSize)
    {
        super(
            vertex,
            fragment
        );

        this.toneScale = toneScale || 0.6;
        this.minBright = minBright || 0.2;

        this.strength = strength || 8;
        this.quality = quality || 4;
        this.resolution = resolution || core.settings.RESOLUTION;
        this.kernelSize = kernelSize || 5;

        this.extractBrightnessFilter = new ExtractBrightnessFilter(this.minBright);
        this.blurXFilter = new BlurXFilter(this.strength, this.quality, this.resolution, this.kernelSize);
        this.blurYFilter = new BlurYFilter(this.strength, this.quality, this.resolution, this.kernelSize);
    }

    apply(filterManager, input, output, clear, currentState)
    {
        const brightTarget = filterManager.getRenderTarget(true);

        this.extractBrightnessFilter.apply(filterManager, input, brightTarget, true, currentState);
        this.blurXFilter.apply(filterManager, brightTarget, brightTarget, true, currentState);
        this.blurYFilter.apply(filterManager, brightTarget, brightTarget, true, currentState);

        this.uniforms.toneScale = this.toneScale;
        this.uniforms.bloomTexture = brightTarget;

        filterManager.applyFilter(this, input, output, clear);

        filterManager.returnRenderTarget(brightTarget);
    }

}
