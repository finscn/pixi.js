import * as core from '../../../../core';
import LightWithAmbient from '../light/LightWithAmbient';

import vertex from './point.vert.js';
import fragment from './point.frag.js';

export default class PointLight extends LightWithAmbient
{
    constructor(options)
    {
        options = options || {};

        super(options);

        this.radius = options.radius || Infinity;

        this.shaderName = 'pointLightShader';
    }

    getVertexSource()
    {
        return vertex;
    }

    getFragmentSource()
    {
        return fragment;
    }

    syncShader(sprite)
    {
        super.syncShader(sprite);

        this.positionArray[0] = this.position.x + (sprite.lightOffsetX || 0);
        this.positionArray[1] = this.position.y + (sprite.lightOffsetY || 0);
        this.positionArray[2] = this.position.z + (sprite.lightOffsetZ || 0);
        this.shader.uniforms.uLightPosition = this.positionArray;

        this.shader.uniforms.uAmbientLightColor = this._ambientLightColorRgba;
        this.shader.uniforms.uLightRadius = this.radius;
    }

    get ambientLightColor()
    {
        return this._ambientLightColor;
    }

    set ambientLightColor(val)
    {
        this._ambientLightColor = val;
        core.utils.hex2rgb(val, this._ambientColorRgba);
    }

    get ambientLightBrightness()
    {
        return this._ambientLightColorRgba[3];
    }

    set ambientLightBrightness(val)
    {
        this._ambientLightColorRgba[3] = val;
    }
}
