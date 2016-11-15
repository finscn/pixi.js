import * as core from '../../../../core';
import Light from '../light/Light';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;

export default class AmbientLight extends Light
{
    constructor(color, brightness)
    {
        super(color, brightness);

        this.shaderName = 'ambientLightShader';
    }

    initShader(gl)
    {
        const vertexSrc = glslify('../light/light.vert');
        const fragmentSrc = glslify('./ambient.frag');
        this.shader = new Shader(gl, vertexSrc, fragmentSrc);
    }
}
