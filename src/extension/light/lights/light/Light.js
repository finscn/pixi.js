import * as core from '../../../../core';
import { BLEND_MODES, DRAW_MODES } from '../../../../core/const';
import NormalQuad from '../NormalQuad.js';
/**
 * Excuse the mess, haven't cleaned this up yet!
 */

export default class Light
{
    constructor(options)
    {
        // this.height = options.height || 0.45;
        this.position = options.position || {
            x: 0,
            y: 0,
        };
        if (!('z' in this.position)) {
            this.position.z = 10;
        }

        this.position.set = function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z !== undefined ? z : this.z;
        };
        this.positionArray = new Float32Array(3);

        // x + y * D + z * D * D
        this.falloff = new Float32Array(options.falloff || [0.75, 3, 20]);

        // color and brightness are exposed through setters
        this._color = 0x4d4d59;
        this._brightness = 1;
        this._colorRgba = new Float32Array([0.3, 0.3, 0.35, this._brightness]);

        // run the color setter
        const color = options.color;
        if (color || color === 0) {
            this.color = color;
        }

        // run the brightness setter
        const brightness = options.brightness;
        if (brightness || brightness === 0) {
            this.brightness = brightness;
        }

        this._vertices = options.vertices || null;
        this._indices = options.indices || null;

        this.blendMode = BLEND_MODES.ADD;
        this.drawMode = DRAW_MODES.TRIANGLES;

        // TODO : disable Light
        this.visible = false;

        this.shaderName = null;
        this.needsUpdate = true;

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
                renderer.bindVao(null);
                this.quad = new NormalQuad(gl, renderer.state.attribState);
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
        shader.uniforms.uLightColor = this._colorRgba;
        shader.uniforms.uLightFalloff = this.falloff;
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
        return this._brightness;
    }

    set brightness(val)
    {
        this._brightness = val;
        this._colorRgba[3] = val;
    }
}

Light.DRAW_MODES = {

};
