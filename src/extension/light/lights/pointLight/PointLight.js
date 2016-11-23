import * as core from '../../../../core';
import Light from '../light/Light';
// import { DRAW_MODES } from '../../../../core/const';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;
// const Circle = core.Graphics.Circle;

export default class PointLight extends Light
{
    constructor(options)
    {

        super(options);

        this.radius = options.radius || Infinity;
        this.ambientLightColor = options.ambientLightColor || [0.6, 0.6, 0.6, 1];

        this.shaderName = 'pointLightShader';
    }

    generateShader(gl)
    {
        const vertexSrc = glslify('./point.vert');
        const fragmentSrc = glslify('./point.frag');
        return new Shader(gl, vertexSrc, fragmentSrc);
    }

    syncShader(sprite)
    {
        super.syncShader(sprite);

        this.positionArray[0] = this.position.x;
        this.positionArray[1] = this.position.y;
        this.positionArray[2] = this.position.z + sprite.lightOffsetZ || 0;
        this.shader.uniforms.uLightPosition = this.positionArray;

        this.shader.uAmbientLightColor = this.ambientLightColor;
        this.shader.uniforms.uLightRadius = this.radius;
    }
}
