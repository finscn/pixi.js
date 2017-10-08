import * as core from '../../core';
import { BLEND_MODES } from '../../core/const';
import AlphaFilter from '../../filters/alpha/AlphaFilter';
import BlurXFilter from '../../filters/blur/BlurXFilter';
import BlurYFilter from '../../filters/blur/BlurYFilter';

export default class BloomFilter extends core.Filter
{

    constructor(sampleCount, strength, quality, resolution)
    {
        super();

        this.sampleCount = sampleCount || 9;
        this.strength = strength || 8;
        this.quality = quality || 4;
        this.resolution = resolution || 1;

        this.defaultFilter = new AlphaFilter();
        this.blurXFilter = new BlurXFilter(this.strength, this.quality, this.resolution, this.sampleCount);
        this.blurYFilter = new BlurYFilter(this.strength, this.quality, this.resolution, this.sampleCount);
        this.blurYFilter.blendMode = BLEND_MODES.SCREEN;
    }

    apply(filterManager, input, output, clear, currentState)
    {
        const renderTarget = filterManager.getRenderTarget(true);

        // TODO - copyTexSubImage2D could be used here?
        this.defaultFilter.apply(filterManager, input, output, clear, currentState);

        this.blurXFilter.apply(filterManager, input, renderTarget, true, currentState);
        this.blurYFilter.apply(filterManager, renderTarget, output, false, currentState);

        filterManager.returnRenderTarget(renderTarget);
    }

    get blur()
    {
        return this.blurXFilter.blur;
    }

    set blur(value)
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
    }

    get blurX()
    {
        return this.blurXFilter.blur;
    }

    set blurX(value)
    {
        this.blurXFilter.blur = value;
    }

    get blurY()
    {
        return this.blurYFilter.blur;
    }

    set blurY(value)
    {
        this.blurYFilter.blur = value;
    }

}

