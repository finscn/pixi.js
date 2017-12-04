import * as core from '../../../../core';
import { BLEND_MODES } from '../../../../core/const';

const Shader = core.Shader;

export default class Light
{
    constructor(options)
    {
        options = options || {};

        // this.height = options.height || 0.45;
        this.position = options.position || {
            x: 0,
            y: 0,
        };

        if (!('z' in this.position))
        {
            this.position.z = 10;
        }

        this.position.set = function (x, y, z)
        {
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
        if ('color' in options)
        {
            this.color = options.color;
        }

        // run the brightness setter
        if ('brightness' in options)
        {
            this.brightness = options.brightness;
        }

        // Default false for the SpriteIlluminator.
        // If use Photoshop , set to true.
        this.invertRed = false;
        if ('invertRed' in options)
        {
            this.invertRed = options.invertRed;
        }

        this.invertGreen = false;
        if ('invertGreen' in options)
        {
            this.invertGreen = options.invertGreen;
        }

        this.precision = 'lowp';
        if ('precision' in options)
        {
            this.precision = options.precision;
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
        if (!this.inited || force)
        {
            const gl = renderer.gl;

            this.viewSize = new Float32Array([renderer.width, renderer.height]);
            this.shader = this.generateShader(gl);
            this.inited = true;
        }
    }

    generateShader(gl)
    {
        const vertexSrc = this.getVertexSource();
        let fragmentSrc = this.getFragmentSource();

        // Default Red hasn't flipped. invertRed means DO flipped.
        if (this.invertRed)
        {
            const invertR = 'normalColor.r = 1.0 - normalColor.r;';

            fragmentSrc = fragmentSrc.replace('// ' + invertR, invertR);
        }

        // Default Green has flipped. invertGreen means DON'T flipped.
        if (this.invertGreen)
        {
            const invertG = 'normalColor.g = 1.0 - normalColor.g;';

            fragmentSrc = fragmentSrc.replace(invertG, '// ' + invertG);
        }

        const id = vertexSrc + '@' + fragmentSrc;
        let shader = Light.shaderCache[id];

        if (!shader)
        {
            Light.shaderCache[id] = shader;
            shader = new Shader(gl, vertexSrc, fragmentSrc, Light.locationMapping, this.precision);
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
Light.locationMapping = {
    aVertexPosition: 0,
    aTextureCoord: 1,
    aNormalTextureCoord: 2,
};

