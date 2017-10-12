import * as core from '../../core';

import vertex from './shockwave.vert.js';
import fragment from './shockwave.frag.js';

export default class ShockwaveFilter extends core.Filter
{
    constructor(center = [0, 0], params = [10, 0.8, 20.0, 1.0], time = 0, duration = 1.0, radius = 50)
    {
        super(
            vertex,
            fragment
        );

        this.center = center;
        this.params = params;
        this.time = time;
        this.duration = duration;
        this.radius = radius;
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
     * [ amplitude, refraction, width, lighter ]
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

    get duration()
    {
        return this.uniforms.uDuration;
    }

    set duration(value)
    {
        this.uniforms.uDuration = value;
    }

    get radius()
    {
        return this.uniforms.uRadius;
    }

    set radius(value)
    {
        this.uniforms.uRadius = value;
    }
}
