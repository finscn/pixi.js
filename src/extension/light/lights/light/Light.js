import * as core from '../../../../core';
import { BLEND_MODES, DRAW_MODES } from '../../../../core/const';
/**
 * Excuse the mess, haven't cleaned this up yet!
 */

const Quad = core.Quad;

export default class Light extends core.DisplayObject
{
    constructor(color, brightness, vertices, indices)
    {
        super();

        this.height = 0.075;

        this.falloff = [0.75, 3, 20];

        // color and brightness are exposed through setters
        this._color = 0x4d4d59;
        this._colorRgba = [0.3, 0.3, 0.35, 0.8];

        // run the color setter
        if (color || color === 0) {
            this.color = color;
        }

        // run the brightness setter
        if (brightness || brightness === 0) {
            this.brightness = brightness;
        }

        this.visible = false;

        this.diffuseTextureLocation = 1;
        this.normalsTextureLocation = 2;

        this.blendMode = BLEND_MODES.ADD;

        this.drawMode = DRAW_MODES.TRIANGLES;

        this._vertices = vertices || null;
        this._indices = indices || null;

        // this.shaderName = null;
        // this.needsUpdate = true;

        this.inited = false;
    }

    init(renderer, force)
    {
        if (!this.inited || force) {
            const gl = renderer.gl;
            this.viewSize = new Float32Array([renderer.width, renderer.height]);
            const shader = this.shader = this.generateShader(gl);

            if (this._vertices && this._indices) {
                // TODO : for custom vertices && indices

            } else {
                this.quad = new Quad(gl, renderer.state.attribState);
                this.quad.initVao(shader);
            }

            this.inited = true;
        }
    }

    generateShader(gl)
    {
        if (!gl) {
            return null;
        }
        // TODO
        return null;
    }

    syncShader()
    {
        const shader = this.shader;

        shader.uniforms.uViewSize = this.viewSize;

        shader.uniforms.uLightColor[0] = this._colorRgba[0];
        shader.uniforms.uLightColor[1] = this._colorRgba[1];
        shader.uniforms.uLightColor[2] = this._colorRgba[2];
        shader.uniforms.uLightColor[3] = this._colorRgba[3];

        shader.uniforms.uLightHeight = this.height;

        shader.uniforms.uLightFalloff[0] = this.falloff[0];
        shader.uniforms.uLightFalloff[1] = this.falloff[1];
        shader.uniforms.uLightFalloff[2] = this.falloff[2];
    }

    get color()
    {
        return this._color;
    }

    set color(val)
    {
        this._color = val;
        core.utils.hex2rgb(val, this._colorRgba);
    }

    get brightness()
    {
        return this._colorRgba[3];
    }

    set brightness(val)
    {
        this._colorRgba[3] = val;
    }
}

Light.DRAW_MODES = {

};
