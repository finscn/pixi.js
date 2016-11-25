import * as core from '../../../../core';
import LightWithAmbient from '../light/LightWithAmbient';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;

export default class DirectionalLight extends LightWithAmbient
{
    constructor(options)
    {
        options = options || {};
        super(options);

        this.target = options.target || {
            x: 0,
            y: 0,
            z: 0,
        };
        this.target.z = this.target.z || 0;

        if (!('z' in this.target)) {
            this.target.z = 0;
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

        this.shader.uniforms.uLightDirection = this.directionArray;
    }
}
