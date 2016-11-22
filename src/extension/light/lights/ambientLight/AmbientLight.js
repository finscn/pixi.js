import * as core from '../../../../core';
import Light from '../light/Light';
import { BLEND_MODES } from '../../../../core/const';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;

export default class AmbientLight extends Light
{
    constructor(options)
    {
        super(options);

        this.height = 1;

        // x + y * D + z * D * D
        this.falloff = [1, 0, 0];

        this.blendMode = BLEND_MODES.NORMAL;

        this.shaderName = 'ambientLightShader';
    }

    generateShader(gl)
    {
        const vertexSrc = glslify('../light/light.vert');
        const fragmentSrc = glslify('./ambient.frag');
        return new Shader(gl, vertexSrc, fragmentSrc);
    }
}
