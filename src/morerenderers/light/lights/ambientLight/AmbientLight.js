import Light from '../light/Light';
import { BLEND_MODES } from '../../../../core/const';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

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
        const vertexSrc = glslify('./ambient.vert');

        return vertexSrc;
    }

    getFragmentSource()
    {
        const fragmentSrc = glslify('./ambient.frag');

        return fragmentSrc;
    }
}