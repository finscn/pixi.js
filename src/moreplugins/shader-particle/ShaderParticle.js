import { Point, ObservablePoint } from '../../core/math';
import Texture from '../../core/textures/Texture';
import DisplayObject from '../../core/display/DisplayObject';
import Bounds from '../../core/display/Bounds';
import { BLEND_MODES } from '../../core/const';

const floatView = new Float32Array(1);
const int32View = new Int32Array(floatView.buffer);

/**
 *
 * @class
 * @extends PIXI.DisplayObject
 * @memberof PIXI
 */
export default class ShaderParticle extends DisplayObject
{
    /**
     * @param {number} count - The count of particles
     * @param {PIXI.Texture} texture - The texture of particles
     * @param {number} fboWidth - The fboWidth of particles
     * @param {number} fboHeight - The fboHeight of particles
     */
    constructor(count, texture, fboWidth = 1024, fboHeight = 1024)
    {
        super();

        this.count = count;

        this.alpha = 1;
        this.colorMultiplier = 1;
        this.colorOffset = new Float32Array([0.0, 0.0, 0.0]);
        this.position = new Point(0, 0);

        this.time = 0.0;
        this.timeStep = 0.0;

        this.defaultFrame = new Float32Array([0.0, 0.0, 1.0, 1.0]);

        this.blendMode = BLEND_MODES.NORMAL;

        this.data = null;
        this.frames = null;
        this.display = null;
        this.statusList = [];

        this.useStatus = [];
        this.useHalfFloat = false;
        this.useOffscreen = true;

        this.pluginName = 'shaderparticle';

        this.fboWidth = fboWidth;
        this.fboHeight = fboHeight;

        /**
         * this is used to store the vertex data of the sprite (basically a quad)
         *
         * @private
         * @member {Float32Array}
         */
        this.vertexData = new Float32Array(8);

        /**
         * The anchor sets the origin point of the texture.
         * The default is 0,0 this means the texture's origin is the top left
         * Setting the anchor to 0.5,0.5 means the texture's origin is centered
         * Setting the anchor to 1,1 would mean the texture's origin point will be the bottom right corner
         *
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this.anchor = new ObservablePoint(this._onAnchorUpdate, this);

        /**
         * The texture that the sprite is using
         *
         * @private
         * @member {PIXI.Texture}
         */
        this._texture = null;

        // call texture setter
        this.texture = texture || Texture.EMPTY;

        this._textureID = -1;

        this._bounds = new Bounds();
    }

    init(gl)
    {
        const particle = this;

        this.statusList.forEach(function (status)
        {
            status.init(gl, particle);
        });
        this.display.init(gl, particle);

        this.inited = true;
    }

    updateStatus(renderer)
    {
        const particle = this;

        this.statusList.forEach(function (status)
        {
            status.update(renderer, particle);
        });
    }

    setDisplay(display)
    {
        this.display = display;
    }

    setStatusList(statusList)
    {
        const particle = this;

        particle.statusList.length = 0;
        particle.useStatus.length = 0;

        statusList.forEach(function (s, index)
        {
            particle.statusList[index] = s;
            particle.useStatus[index] = index;
        });
    }

    addStatus(status)
    {
        const index = this.statusList.length;

        this.statusList.push(status);
        this.useStatus[index] = index;
    }

    setData(data)
    {
        this.data = data;
    }

    setFrames(frames)
    {
        this.frames = frames;
    }

    getUvs(x, y, width, height)
    {
        const baseTexture = this._texture.baseTexture;
        const tw = baseTexture.width;
        const th = baseTexture.height;

        return [
            x / tw,
            y / th,

            (x + width) / tw,
            y / th,

            (x + width) / tw,
            (y + height) / th,

            x / tw,
            (y + height) / th,
        ];
    }

    bindTargetTexture(renderer, texture, textureLocation)
    {
        renderer.boundTextures[textureLocation] = renderer.emptyTextures[textureLocation];

        texture.bind(textureLocation);
    }

    // var halfFloatData = new Uint16Array(4);
    // // will divide by 400 in shader to prove it works.
    // halfFloatData[0] = toHalfFloat(100);
    // halfFloatData[1] = toHalfFloat(200);
    // halfFloatData[2] = toHalfFloat(300);
    // halfFloatData[3] = toHalfFloat(400);

    toHalfFloat(value)
    {
        floatView[0] = value;

        const x = int32View[0];
        const e = (x >> 23) & 0xff; /* Using int is faster here */
        let bits = (x >> 16) & 0x8000; /* Get the sign */
        let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */

        /* If zero, or denormal, or exponent underflows too much for a denormal
         * half, return signed zero. */
        if (e < 103)
        {
            return bits;
        }

        /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
        if (e > 142)
        {
            bits |= 0x7c00;
            /* If exponent was 0xff and one mantissa bit was set, it means NaN,
                       * not Inf, so make sure we set one mantissa bit too. */
            bits |= ((e === 255) ? 0 : 1) && (x & 0x007fffff);

            return bits;
        }

        /* If exponent underflows but not too much, return a denormal */
        if (e < 113)
        {
            m |= 0x0800;
            /* Extra rounding may overflow and set mantissa to 0 and exponent
            * to 1, which is OK. */
            bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);

            return bits;
        }

        bits |= ((e - 112) << 10) | (m >> 1);
        /* Extra rounding. An overflow will set mantissa to 0 and increment
         * the exponent, which is OK. */
        bits += m & 1;

        return bits;
    }

    setRegion(x, y, width, height)
    {
        this._bounds.minX = x;
        this._bounds.minY = y;
        this._bounds.maxX = x + width;
        this._bounds.maxY = y + height;

        this._bounds.rect = this._bounds.getRectangle(this._bounds.rect);
    }

    getRegion()
    {
        return this._bounds.rect;
    }

    calculateBounds()
    {
        // nothing to do
    }

    renderCanvas()
    {
        // nothing to do
    }

    renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);

        this.statusList.forEach(function (status)
        {
            status.swapRenderTarget();
        });
    }

    /**
     * Called when the anchor position updates.
     *
     * @private
     */
    _onAnchorUpdate()
    {
        this.calculateVertices(true);
    }

    /**
     * When the texture is updated, this event will fire to update the scale and frame
     *
     * @private
     */
    _onTextureUpdate()
    {
        this._textureID = -1;

        this.calculateVertices(true);
    }

    calculateVertices(force)
    {
        if (force !== true && this._textureID === this._texture._updateID)
        {
            return;
        }

        this._textureID = this._texture._updateID;

        // set the vertex data

        const texture = this._texture;
        const trim = texture.trim;
        const orig = texture.orig;

        const vertexData = this.vertexData;
        const anchor = this.anchor;

        let w0 = 0;
        let w1 = 0;
        let h0 = 0;
        let h1 = 0;

        if (trim)
        {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
            // space before transforming the sprite coords.
            w1 = trim.x - (anchor._x * orig.width);
            w0 = w1 + trim.width;

            h1 = trim.y - (anchor._y * orig.height);
            h0 = h1 + trim.height;
        }
        else
        {
            w1 = -anchor._x * orig.width;
            w0 = w1 + orig.width;

            h1 = -anchor._y * orig.height;
            h0 = h1 + orig.height;
        }

        // xy
        vertexData[0] = w1;
        vertexData[1] = h1;

        // xy
        vertexData[2] = w0;
        vertexData[3] = h1;

         // xy
        vertexData[4] = w0;
        vertexData[5] = h0;

        // xy
        vertexData[6] = w1;
        vertexData[7] = h0;
    }

    /**
     * Update texture if the content of texture has changed.
     * e.g. If texture is based on a canvas , and after the canvas changed, please call this method.
     */
    updateTexture()
    {
        const baseTexture = this._texture.baseTexture;

        this._onTextureUpdate();

        baseTexture.emit('update', baseTexture);
    }

    /**
     * Destroys this sprite and optionally its texture and children
     *
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well
     */
    destroy(options)
    {
        this.anchor = null;
        this.vertexData = null;

        const destroyTexture = typeof options === 'boolean' ? options : options && options.texture;

        if (destroyTexture)
        {
            const destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;

            this._texture.destroy(!!destroyBaseTexture);
        }

        this._texture = null;
    }

    /**
     * The texture that the sprite is using
     *
     * @member {PIXI.Texture}
     */
    get texture()
    {
        return this._texture;
    }

    set texture(value) // eslint-disable-line require-jsdoc
    {
        if (this._texture === value)
        {
            return;
        }

        this._texture = value;
        this._textureID = -1;

        if (value)
        {
            // wait for the texture to load
            if (value.baseTexture.hasLoaded)
            {
                this._onTextureUpdate();
            }
            else
            {
                value.once('update', this._onTextureUpdate, this);
            }
        }
    }
}
