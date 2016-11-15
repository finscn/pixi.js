import * as core from '../../../../core';
import Light from '../light/Light';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;

export default class DirectionalLight extends Light
{
    constructor(color, brightness, target)
    {
        super(color, brightness);

        this.target = target;
        this._directionVector = new core.Point();

        this.shaderName = 'directionalLightShader';
    }

    initShader(gl)
    {
        const vertexSrc = glslify('../light/light.vert');
        const fragmentSrc = glslify('./directional.frag');
        this.shader = new Shader(gl, vertexSrc, fragmentSrc);
    }

    updateTransform()
    {
        super.updateTransform();

        const vec = this._directionVector;
        const wt = this.worldTransform;
        const tx = this.target.worldTransform ? this.target.worldTransform.tx : this.target.x;
        const ty = this.target.worldTransform ? this.target.worldTransform.ty : this.target.y;

        // calculate direction from this light to the target
        vec.x = wt.tx - tx;
        vec.y = wt.ty - ty;

        // normalize
        const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        vec.x /= len;
        vec.y /= len;
    }

    syncShader()
    {
        const shader = this.shader;
        super.syncShader(shader);

        shader.uniforms.uLightDirection.value[0] = this._directionVector.x;
        shader.uniforms.uLightDirection.value[1] = this._directionVector.y;
    }

}

