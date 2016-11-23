import * as core from '../../../../core';
import Light from './Light';
import { BLEND_MODES } from '../../../../core/const';

export default class LightWithAmbient extends Light
{
    constructor(options)
    {

        super(options);

        this._ambientColor = 0x000000;
        this._ambientBrightness = 1;
        this._ambientColorRgba = new Float32Array([0, 0, 0, this._ambientBrightness]);
        // run the color setter
        const ambientColor = options.ambientColor;
        if (ambientColor || ambientColor === 0) {
            this.ambientColor = ambientColor;
        }

        // run the brightness setter
        const ambientBrightness = options.ambientBrightness;
        if (ambientBrightness || ambientBrightness === 0) {
            this.ambientBrightness = ambientBrightness;
        }

    }

    syncShader()
    {
        const shader = this.shader;

        shader.uniforms.uViewSize = this.viewSize;
        shader.uniforms.uLightColor = this._colorRgba;
        shader.uniforms.uLightFalloff = this.falloff;
        shader.uniforms.uAmbientColor = this._ambientColorRgba;
    }

    get ambientColor()
    {
        return this._ambientColor;
    }

    set ambientColor(val)
    {
        this._ambientColor = val;
        core.utils.hex2rgb(val, this._ambientColorRgba);
        if (val === 0 && this._ambientBrightness === 0) {
            this.blendMode = BLEND_MODES.ADD;
        } else {
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
        this._ambientColorRgba[3] = val;
        if (val === 0 && this._ambientColor === 0) {
            this.blendMode = BLEND_MODES.ADD;
        } else {
            this.blendMode = BLEND_MODES.NORMAL;
        }
    }
}
