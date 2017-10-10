import * as core from '../../core';
import vertex from './shockwave.vert.js';
import fragment from './shockwave.frag.js';

export default class ShockwaveFilter extends core.Filter
{
    constructor()
    {
        super(
            vertex,
            fragment
        );

        this._rendererSize = new Float32Array([0, 0]);
        this.viewSize = null;
        this.radius = 100;
        this.center = new Float32Array([0, 0]);
        this.params = new Float32Array([10, 0.8, 20.0, 1.0]);
        this.duration = 1.0;
        this.time = 0;
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

        this.uniforms.uRadius = this.radius;
        this.uniforms.uCenter = this.center;
        this.uniforms.uParams = this.params;
        this.uniforms.uDuration = this.duration;
        this.uniforms.uTime = this.time;

        filterManager.applyFilter(this, input, output, clear);
    }

    setRadius(radius)
    {
        this.radius = radius;
    }

    setDuration(duration)
    {
        this.duration = duration;
    }

    setTime(time)
    {
        this.time = time;
    }

    setCenter(x, y)
    {
        this.center[0] = x;
        this.center[1] = y;
    }

    setParams(amplitude, refraction, width, lighter)
    {
        this.params[0] = amplitude;
        this.params[1] = refraction;
        this.params[2] = width;
        this.params[3] = lighter || 1.0;
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
