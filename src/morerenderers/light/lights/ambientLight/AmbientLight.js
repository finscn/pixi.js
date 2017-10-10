import Light from '../light/Light';
import { BLEND_MODES } from '../../../../core/const';

import vertex from './ambient.vert.js';
import fragment from './ambient.frag.js';

export default class AmbientLight extends Light
{
    constructor(options)
    {
        options = options || {};

        super(options);

        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;

        // x + y * D + z * D * D
        this.falloff = new Float32Array([1, 0, 0]);

        this.blendMode = BLEND_MODES.NORMAL;

        this.shaderName = 'ambientLightShader';
    }

    getVertexSource()
    {
        return vertex;
    }

    getFragmentSource()
    {
        return fragment;
    }
}
