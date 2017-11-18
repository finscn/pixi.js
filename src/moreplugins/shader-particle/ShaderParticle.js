import { Point, ObservablePoint } from '../../core/math';
import { sign } from '../../core/utils';
import Texture from '../../core/textures/Texture';
import DisplayObject from '../../core/display/DisplayObject';
import { BLEND_MODES } from '../../core/const';

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * let sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export default class ShaderParticle extends DisplayObject
{
    /**
     * @param {number} count - The count of particles
     * @param {PIXI.Texture} texture - The texture for this particle
     * @param {number} width - The width of this particle
     * @param {number} height - The height of this particle
     */
    constructor(count, texture, width, height)
    {
        super();

        this.count = count;

        this.alpha = 1;
        this.colorMultiplier = 1;
        this.colorOffset = new Float32Array([0.0, 0.0, 0.0]);
        this.position = new Point(0, 0);

        this.blendMode = BLEND_MODES.NORMAL;

        this.statusList = null;
        this.display = null;

        this.pluginName = 'shaderparticle';

        /**
         * this is used to store the vertex data of the sprite (basically a quad)
         *
         * @private
         * @member {Float32Array}
         */
        this.vertexData = new Float32Array(8);

        this._scale = new Point(1, 1);

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

        /**
         * The width of the sprite (this is initially set by the texture)
         *
         * @private
         * @member {number}
         */
        this._width = 0;
        if (width)
        {
            this.width = width;
        }

        /**
         * The height of the sprite (this is initially set by the texture)
         *
         * @private
         * @member {number}
         */
        this._height = 0;
        if (height)
        {
            this.height = height;
        }
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

    updateStatus(renderer, timeStep, now)
    {
        const particle = this;

        this.statusList.forEach(function (status)
        {
            status.update(renderer, particle, timeStep, now);
        });
    }

    setStatusList(statusList)
    {
        this.statusList = statusList;
    }

    setDisplay(display)
    {
        this.display = display;
    }

    bindTargetTexture(renderer, texture, textureIndex)
    {
        const gl = renderer.gl;

        renderer.boundTextures[textureIndex] = renderer.emptyTextures[textureIndex];
        gl.activeTexture(gl.TEXTURE0 + textureIndex);

        texture.bind();
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

        // so if _width is 0 then width was not set..
        if (this._width)
        {
            this._scale.x = sign(this._scale.x) * this._width / this._texture.orig.width;
        }

        if (this._height)
        {
            this._scale.y = sign(this._scale.y) * this._height / this._texture.orig.height;
        }

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
        const scale = this._scale;
        const anchor = this.anchor;

        let w0 = 0;
        let w1 = 0;
        let h0 = 0;
        let h1 = 0;

        if (trim)
        {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
            // space before transforming the sprite coords.
            w1 = (trim.x - (anchor._x * orig.width)) * scale.x;
            w0 = w1 + trim.width * scale.x;

            h1 = (trim.y - (anchor._y * orig.height)) * scale.y;
            h0 = h1 + trim.height * scale.y;
        }
        else
        {
            w1 = -anchor._x * orig.width * scale.x;
            w0 = w1 + orig.width * scale.x;

            h1 = -anchor._y * orig.height * scale.y;
            h0 = h1 + orig.height * scale.y;
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
        this._scale = null;
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
     * The width of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width()
    {
        return this._scale.x * this._texture.orig.width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        this._scale.x = value / this._texture.orig.width;
        this._width = value;
    }

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height()
    {
        return this._scale.y * this._texture.orig.height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        this._scale.y = value / this._texture.orig.height;
        this._height = value;
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
