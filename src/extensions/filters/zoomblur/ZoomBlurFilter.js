import * as core from '../../../core';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

export default class ZoomBlurFilter extends core.Filter
{
    constructor(centerX, centerY, strength)
    {
        const vertSrc = glslify('../../../filters/fragments/default.vert');
        const fragSrc = glslify('./zoomblur.frag');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.viewSize = null;
        this.radius = 100;
        this.center = new Float32Array([centerX || 0, centerY || 0]);
        this.strength = strength === 0 || strength ? strength : 0.1;
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
        this.uniforms.uStrength = this.strength;

        filterManager.applyFilter(this, input, output, clear);
    }

    setRadius(radius)
    {
        this.radius = radius;
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
        else
        {
            this.viewSize[0] = width;
            this.viewSize[1] = height;
        }
    }
}
