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

        this.minBright = minBright;
    }

}

