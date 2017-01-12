import * as core from '../../../core';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

export default class ShockwaveFilter extends core.Filter
{
    constructor()
    {
        const vertSrc = glslify('../../../filters/fragments/default.vert');
        const fragSrc = glslify('./shockwave.frag');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.viewSize = null;
        this.radius = 100;
        this.center = new Float32Array([0, 0]);
        this.params = new Float32Array([10, 0.8, 0.1]);
        this.duration = 1.0;
        this.time = 0;
    }

    apply(filterManager, input, output, clear)
    {
        if (!this.viewSize)
        {
            this.viewSize = new Float32Array([
                filterManager.renderer.width,
                filterManager.renderer.height,
            ]);
        }

        this.uniforms.uViewSize = this.viewSize;
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

    setParams(a, b, c)
    {
        this.params[0] = a;
        this.params[1] = b;
        this.params[2] = c;
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
        else
        {
            this.viewSize[0] = width;
            this.viewSize[1] = height;
        }
    }
}
