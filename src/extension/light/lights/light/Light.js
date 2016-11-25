import * as core from '../../../../core';
import { BLEND_MODES } from '../../../../core/const';
import NormalQuad from '../NormalQuad.js';

const Shader = core.Shader;

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
        this.colorArray = new Float32Array([0, 0, 0]);
        this._color = 0x555555;
        this._brightness = 1;
        this._colorRgb = new Float32Array([0.33, 0.33, 0.33]);

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

        this.blendMode = BLEND_MODES.ADD;

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

            renderer.bindVao(null);
            if (!Light.quad) {
                const quad = new NormalQuad(gl, renderer.state.attribState);
                quad.initVao(shader);
                Light.quad = quad;
            }
            this.quad = Light.quad;

            this.inited = true;
        }
    }

    generateShader(gl)
    {
        const vertexSrc = this.getVertexSource();
        const fragmentSrc = this.getFragmentSource();
        const id = vertexSrc + '@' + fragmentSrc;
        let shader = Light.shaderCache[id];
        if (!shader) {
            shader = new Shader(gl, vertexSrc, fragmentSrc);
        }
        return shader;
    }

    getVertexSource()
    {
        // TODO
    }

    getFragmentSource()
    {
        // TODO
    }

    updateColor()
    {
        const arr = this.colorArray;
        const rgb = this._colorRgb;
        const b = this._brightness;
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
    }

    get color()
    {
        return this._color;
    }

    set color(val)
    {
        this._color = val;
        core.utils.hex2rgb(val || 0, this._colorRgb);
        this.updateColor();
    }

    get brightness()
    {
        return this._brightness;
    }

    set brightness(val)
    {
        this._brightness = val;
        this.updateColor();
    }
}

Light.shaderCache = {};
Light.quad = null;

