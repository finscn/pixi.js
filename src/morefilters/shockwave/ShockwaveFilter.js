import * as core from '../../core';

import vertex from './shockwave.vert.js';
import fragment from './shockwave.frag.js';

export default class ShockwaveFilter extends core.Filter
{
    constructor(center = [0, 0], params = [30.0, 30.0, 1.0, 1.0], radius = 100, duration = 1.0, time = 0)
    {
        super(
            vertex,
            fragment
        );

        this.center = center;
        this.params = params;
        this.radius = radius;
        this.duration = duration;
        this.time = time;
    }

    /**
     * Center of the effect.
     *
     * @member {PIXI.Point|number[]}
     * @default [0, 0]
     */
    get center()
    {
        return this.uniforms.uCenter;
    }

    set center(value)
    {
        this.uniforms.uCenter = value;
    }

    /**
     * Sets the params of the shockwave. These modify the look and behavior of
     * the shockwave as it ripples out.
     * [ amplitude, wavelength, refraction, lighter ]
     * @member {Array<number>}
     */
    get params()
    {
        return this.uniforms.uParams;
    }

    set params(value)
    {
        this.uniforms.uParams = value;
    }

    get radius()
    {
        return this.uniforms.uRadius;
    }

    set radius(value)
    {
        this.uniforms.uRadius = value;
    }

    get duration()
    {
        return this.uniforms.uDuration;
    }

    set duration(value)
    {
        this.uniforms.uDuration = value;
    }

    /**
     * Sets the elapsed time of the shockwave. This controls the speed at which
     * the shockwave ripples out.
     *
     * @member {number}
     */
    get time()
    {
        return this.uniforms.uTime;
    }

    set time(value)
    {
        this.uniforms.uTime = value;
    }
}
