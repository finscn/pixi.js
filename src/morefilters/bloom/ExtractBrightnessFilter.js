import * as core from '../../core';

import vertex from './extract-brightness.vert.js';
import fragment from './extract-brightness.frag.js';

export default class ExtractBrightnessFilter extends core.Filter
{
    constructor(minBright)
    {
        super(
            vertex,
            fragment
        );

        this.minBright = minBright || 0.5;
    }

    get minBright()
    {
        return this.uniforms.minBright;
    }

    set minBright(value)
    {
        this.uniforms.minBright = value;
    }
}

