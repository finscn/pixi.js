import * as core from '../../../../core';
import Light from './Light';
import { BLEND_MODES } from '../../../../core/const';

export default class LightWithAmbient extends Light
{
    constructor(options)
    {
        options = options || {};

        super(options);

        this.blendMode = BLEND_MODES.ADD;

        this.ambientColorArray = new Float32Array([0, 0, 0]);

        this._ambientColorRgb = new Float32Array([0, 0, 0]);
        this._ambientColor = null;
        this._ambientBrightness = 1;

        if ('ambientColor' in options)
        {
            this.ambientColor = options.ambientColor;
        }

        if ('ambientBrightness' in options)
        {
            this.ambientBrightness = options.ambientBrightness;
        }
    }

    updateAmbientColor()
    {
        const arr = this.ambientColorArray;
        const rgb = this._ambientColorRgb;
        const b = this._ambientBrightness;

        arr[0] = rgb[0] * b;
        arr[1] = rgb[1] * b;
        arr[2] = rgb[2] * b;
    }

    syncShader()
    {
        const shader = this.shader;

        shader.uniforms.uViewSize = this.viewSize;
        shader.uniforms.uLightColor = this.colorArray;
        shader.uniforms.uLightFalloff = this.falloff;
        shader.uniforms.uAmbientColor = this.ambientColorArray;
    }

    get ambientColor()
    {
        return this._ambientColor;
    }

    set ambientColor(val)
    {
        this._ambientColor = val;
        core.utils.hex2rgb(val || 0, this._ambientColorRgb);
        this.updateAmbientColor();
        if (val === null)
        {
            this.blendMode = BLEND_MODES.ADD;
        }
        else
        {
            this.blendMode = BLEND_MODES.NORMAL;
        }
    }

    get ambientBrightness()
    {
        return this._ambientBrightness;
    }

    set ambientBrightness(val)
    {
        this._ambientBrightness = val;
        this.updateAmbientColor();
    }
}
