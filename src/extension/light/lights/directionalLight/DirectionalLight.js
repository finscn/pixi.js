import * as core from '../../../../core';
import Light from '../light/Light';
import { BLEND_MODES } from '../../../../core/const';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;

export default class DirectionalLight extends Light
{
    constructor(options)
    {
        super(options);

        this.target = options.target;

        if (!('z' in this.target)) {
            this.target.z = 0;
        }

        if (options.ambientLightColor) {
            this.ambientLightColor = new Float32Array(options.ambientLightColor);
            this.blendMode = BLEND_MODES.NORMAL;
        } else {
            this.ambientLightColor = new Float32Array([0, 0, 0, 0]);
        }


        this.shaderName = 'directionalLightShader';

        this.directionArray = new Float32Array(3);
        this.updateDirection();
    }

    generateShader(gl)
    {
        const vertexSrc = glslify('../light/light.vert');
        const fragmentSrc = glslify('./directional.frag');
        return new Shader(gl, vertexSrc, fragmentSrc);
    }

    updateDirection()
    {
        const arr = this.directionArray;
        const tx = this.target.x;
        const ty = this.target.y;
        const tz = this.target.z;

        arr[0] = this.position.x - tx;
        arr[1] = this.position.y - ty;
        arr[2] = this.position.z - tz;
    }

    syncShader(sprite)
    {
        super.syncShader(sprite);

        this.shader.uAmbientLightColor = this.ambientLightColor;
        this.shader.uniforms.uLightDirection = this.directionArray;
    }
}
