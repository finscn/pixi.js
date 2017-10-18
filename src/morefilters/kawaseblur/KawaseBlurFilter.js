import * as core from '../../core';

import vertex from './kawase-blur.vert.js';
import fragment from './kawase-blur.frag.js';

export default class KawaseBlurFilter extends core.Filter
{
    constructor()
    {
        super(
            vertex,
            fragment
        );
    }

    apply(filterManager, input, output, clear, currentState)
    {
        const width = currentState.renderTarget.size.width;
        const height = currentState.renderTarget.size.height;

        this.uniforms.pixelSize = [1.0 / width, 1.0 / height];

        const renderTargetA = filterManager.getRenderTarget(true);
        const renderTargetB = filterManager.getRenderTarget(true);

        this.uniforms.iteration = 0.0;
        filterManager.applyFilter(this, input, renderTargetA, false);
        this.uniforms.iteration = 1.0;
        filterManager.applyFilter(this, renderTargetA, renderTargetB, false);
        this.uniforms.iteration = 2.0;
        filterManager.applyFilter(this, renderTargetB, renderTargetA, false);
        this.uniforms.iteration = 2.0;
        filterManager.applyFilter(this, renderTargetA, renderTargetB, false);
        this.uniforms.iteration = 3.0;
        filterManager.applyFilter(this, renderTargetB, output, clear);

        filterManager.returnRenderTarget(renderTargetA);
        filterManager.returnRenderTarget(renderTargetB);
    }
}
