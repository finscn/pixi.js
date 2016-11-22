import * as core from '../../../../core';
import Light from '../light/Light';
import { BLEND_MODES } from '../../../../core/const';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;
const Point = core.Point;

export default class DirectionalLight extends Light
{
    constructor(options)
    {
        super(options);

        this.target = options.target;
        this.ambientLightColor = options.ambientLightColor || [0.6, 0.6, 0.6, 1];

        this._directionVector = new Point();

        this.shaderName = 'directionalLightShader';

        this.directionArray = new Float32Array(2);

    }

    generateShader(gl)
    {
        const vertexSrc = glslify('../light/light.vert');
        const fragmentSrc = glslify('./directional.frag');
        return new Shader(gl, vertexSrc, fragmentSrc);
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
        // const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        // vec.x /= len;
        // vec.y /= len;
    }

    syncShader()
    {
        super.syncShader();
        this.directionArray[0] = this._directionVector.x;
        this.directionArray[1] = this._directionVector.y;
        this.shader.uniforms.uLightDirection = this.directionArray;
        this.shader.uniforms.uAmbientLightColor = this.ambientLightColor;
    }

}

