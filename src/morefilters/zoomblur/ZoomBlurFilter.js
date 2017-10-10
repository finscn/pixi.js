import * as core from '../../core';
import vertex from './zoom-blur.vert.js';
import fragment from './zoom-blur.frag.js';

export default class ZoomBlurFilter extends core.Filter
{
    constructor(centerX, centerY, strength)
    {
        super(
            vertex,
            fragment
        );

        this._rendererSize = new Float32Array([0, 0]);
        this.viewSize = null;
        this.minRadius = 0;
        this.radius = 1E9;
        this.center = new Float32Array([centerX || 0, centerY || 0]);
        this.strength = strength === 0 || strength ? strength : 0.1;
    }

    apply(filterManager, input, output, clear)
    {
        if (this.viewSize)
        {
            this.uniforms.uViewSize = this.viewSize;
        }
        else
        {
            this._rendererSize[0] = filterManager.renderer.width;
            this._rendererSize[1] = filterManager.renderer.height;
            this.uniforms.uViewSize = this._rendererSize;
        }

        this.uniforms.uMinRadius = this.minRadius;
        this.uniforms.uRadius = this.radius;
        this.uniforms.uCenter = this.center;
        this.uniforms.uStrength = this.strength;

        filterManager.applyFilter(this, input, output, clear);
    }

    setRadius(radius)
    {
        this.radius = radius;
    }

    setMinRadius(minRadius)
    {
        this.minRadius = minRadius;
    }

    setStrength(strength)
    {
        this.strength = strength;
    }

    setCenter(x, y)
    {
        this.center[0] = x;
        this.center[1] = y;
    }

    setViewSize(width, height)
    {
        if (width === null)
        {
            this.viewSize = null;

            return;
        }
        if (!this.viewSize)
        {
            this.viewSize = new Float32Array(2);
        }
        this.viewSize[0] = width;
        this.viewSize[1] = height;
    }
}
