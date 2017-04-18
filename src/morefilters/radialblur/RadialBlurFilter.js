import * as core from '../../core';
import RadialBlurXFilter from './RadialBlurXFilter';
import RadialBlurYFilter from './RadialBlurYFilter';

export default class RadialBlurFilter extends core.Filter
{

    constructor(strength, quality, resolution, kernelSize)
    {
        super();

        this.blurXFilter = new RadialBlurXFilter(strength, quality, resolution, kernelSize);
        this.blurYFilter = new RadialBlurYFilter(strength, quality, resolution, kernelSize);
        this.resolution = 1;

        this.padding = 0;
        this.resolution = resolution || 1;
        this.quality = quality || 4;
        this.blur = strength || 8;
    }

    apply(filterManager, input, output)
    {
        const renderTarget = filterManager.getRenderTarget(true);

        this.blurXFilter.apply(filterManager, input, renderTarget, true);
        this.blurYFilter.apply(filterManager, renderTarget, output, false);

        filterManager.returnRenderTarget(renderTarget);
    }

    setCenter(x, y)
    {
        this.blurXFilter.setCenter(x, y);
        this.blurYFilter.setCenter(x, y);
    }

    getCenter()
    {
        return this.blurXFilter._center;
    }

    get minRadius()
    {
        return this.blurXFilter._minRadius;
    }

    set minRadius(value)
    {
        this.blurXFilter._minRadius = value;
        this.blurYFilter._minRadius = value;
    }

    get blur()
    {
        return this.blurXFilter.blur;
    }

    set blur(value)
    {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
        this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }

    get quality()
    {
        return this.blurXFilter.quality;
    }

    set quality(value)
    {
        this.blurXFilter.quality = this.blurYFilter.quality = value;
    }

    get blurX()
    {
        return this.blurXFilter.blur;
    }

    set blurX(value)
    {
        this.blurXFilter.blur = value;
        this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }

    get blurY()
    {
        return this.blurYFilter.blur;
    }

    set blurY(value)
    {
        this.blurYFilter.blur = value;
        this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }
}
