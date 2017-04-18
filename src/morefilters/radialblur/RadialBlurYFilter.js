// import * as core from '../../core';
import RadialBlurXFilter from './RadialBlurXFilter';

export default class RadialBlurYFilter extends RadialBlurXFilter
{
    constructor(strength, quality, resolution, kernelSize)
    {
        super(
            strength, quality, resolution, kernelSize, false
        );
    }
}
