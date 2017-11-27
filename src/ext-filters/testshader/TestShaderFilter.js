import * as core from '../../core';

import vertex from './test-shader.vert.js';
import fragment from './test-shader.frag.js';

export default class TestShaderFilter extends core.Filter
{
    constructor()
    {
        super(
            vertex,
            fragment
        );

        this.alpha = 1.0;
        this.glShaderKey = 'test-shader';
    }

    apply(filterManager, input, output, clear, currentState) // eslint-disable-line no-unused-vars
    {
        // const renderTarget = filterManager.getRenderTarget(true);

        this.uniforms.uAlpha = this.alpha;

        filterManager.applyFilter(this, input, output, clear);

        // filterManager.returnRenderTarget(renderTarget);
    }
}
