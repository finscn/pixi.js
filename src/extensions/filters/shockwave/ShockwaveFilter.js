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

        this.center = new Float32Array([0, 0]);
        this.falloff = new Float32Array([10, 0.8, 0.1]);
        this.time = 0;
        this.radius = 100;
        this.viewSize = null;
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

        this.uniforms.uCenter = this.center;
        this.uniforms.uFalloff = this.falloff;
        this.uniforms.uTime = this.time;
        this.uniforms.uRadius = this.radius;
        this.uniforms.uViewSize = this.viewSize;

        filterManager.applyFilter(this, input, output, clear);
    }

    setRadius(radius)
    {
        this.radius = radius;
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

    setFalloff(a, b, c)
    {
        this.falloff[0] = a;
        this.falloff[1] = b;
        this.falloff[2] = c;
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
