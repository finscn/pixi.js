import { Point } from '../../core/math';
import { sign } from '../../core/utils';
import Texture from '../../core/textures/Texture';

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
export default class ShaderParticle
{
    /**
     * @param {PIXI.Texture} texture - The texture for this sprite
     */
    constructor(texture)
    {
        /**
         * The opacity of the object.
         *
         * @member {number}
         */
        this.alpha = 1;

        /**
         * The colorMultiplier of the object.
         *
         * @member {number}
         */
        this.colorMultiplier = 1.0;

        /**
         * The colorOffset of the object.
         *
         * @member {number}
         */
        this.colorOffset = 0x000000;

        /**
        * The coordinate of the object relative to the local coordinates of the parent.
        *
        * @member {PIXI.Point}
        */
        this.position = new Point(0, 0);

        this.velocity = new Point(0, 0);
        this.accVelocity = new Point(0, 0);

        /**
         * The rotation value of the object, in radians
         *
         * @member {Number}
         * @private
         */
        this.rotation = 0;

        this.velocityRotate = 0;
        this.accVelocityRotate = 0;

        /**
         * The scale factor of the object.
         *
         * @member {PIXI.Point}
         */
        this.scale = new Point(1, 1);

        /**
         * The skew amount, on the x and y axis.
         *
         * @member {PIXI.Point}
         */
        this.skew = new Point(0, 0);

        /**
         * The pivot point of the object that it rotates around
         *
         * @member {PIXI.Point}
         */
        this.pivot = new Point(0, 0);

        /**
         * The texture that the sprite is using
         *
         * @private
         * @member {PIXI.Texture}
         */
        this._texture = null;

        /**
         * The width of the sprite (this is initially set by the texture)
         *
         * @private
         * @member {number}
         */
        this._width = 0;

        /**
         * The height of the sprite (this is initially set by the texture)
         *
         * @private
         * @member {number}
         */
        this._height = 0;

        // call texture setter
        this.texture = texture || Texture.EMPTY;

        /**
         * this is used to store the vertex data of the sprite (basically a quad)
         *
         * @private
         * @member {Float32Array}
         */
        this.vertexData = new Float32Array(8);

        this._textureID = -1;

        this.state = {
            alpha: 0,
            colorMultiplier: 0,
            colorOffset: 0,
            rotation: 0,
            position: new Point(),
            velocity: new Point(),
            scale: new Point(),
            skew: new Point(),
            pivot: new Point(),
        };
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
            this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
        }

        if (this._height)
        {
            this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
        }

        this.calculateVertices();
    }

    save()
    {
        const state = this.state;

        state.alpha = this.alpha;
        state.colorMultiplier = this.colorMultiplier;
        state.colorOffset = this.colorOffset;
        state.rotation = this.rotation;
        state.position.copy(this.position);
        state.velocity.copy(this.velocity);
        state.scale.copy(this.scale);
        state.skew.copy(this.skew);
        state.pivot.copy(this.pivot);
    }

    restore()
    {
        const state = this.state;

        this.alpha = state.alpha;
        this.colorMultiplier = state.colorMultiplier;
        this.colorOffset = state.colorOffset;
        this.rotation = state.rotation;
        this.position.copy(state.position);
        this.velocity.copy(state.velocity);
        this.scale.copy(state.scale);
        this.skew.copy(state.skew);
        this.pivot.copy(state.pivot);

        this.calculateVertices();
    }

    calculateVertices()
    {
        if (this._textureID === this._texture._updateID)
        {
            return;
        }

        this._textureID = this._texture._updateID;

        // set the vertex data

        const texture = this._texture;
        const vertexData = this.vertexData;
        const trim = texture.trim;
        const orig = texture.orig;
        const pivot = this.pivot;

        let w0 = 0;
        let w1 = 0;
        let h0 = 0;
        let h1 = 0;

        if (trim)
        {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
            // space before transforming the sprite coords.
            w1 = trim.x - pivot.x;
            w0 = w1 + trim.width;

            h1 = trim.y - pivot.y;
            h0 = h1 + trim.height;
        }
        else
        {
            w1 = -pivot.x;
            w0 = w1 + orig.width;

            h1 = -pivot.y;
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
        this.alpha = null;
        this.rotation = null;
        this.position = null;
        this.velocity = null;
        this.accVelocity = null;
        this.scale = null;
        this.skew = null;
        this.pivot = null;

        this.state = null;

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
        return Math.abs(this.scale.x) * this._texture.orig.width;
    }

    set width(value) // eslint-disable-line require-jsdoc
    {
        const s = sign(this.scale.x) || 1;

        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
    }

    /**
     * The height of the sprite, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height()
    {
        return Math.abs(this.scale.y) * this._texture.orig.height;
    }

    set height(value) // eslint-disable-line require-jsdoc
    {
        const s = sign(this.scale.y) || 1;

        this.scale.y = s * value / this._texture.orig.height;
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

    /**
     * The orig of the texture
     *
     * @member {PIXI.Rectangle}
     */
    get orig()
    {
        return this._texture.orig;
    }

    /**
     * The frame of the texture
     *
     * @member {PIXI.Rectangle}
     */
    get frame()
    {
        return this._texture.frame;
    }

    /**
     * The trim of the texture
     *
     * @member {PIXI.Rectangle}
     */
    get trim()
    {
        return this._texture.trim;
    }

    /**
     * The baseTexture of the texture
     *
     * @member {PIXI.BaseTexture}
     */
    get baseTexture()
    {
        return this._texture.baseTexture;
    }

    /**
     * The width of the texture's real size
     *
     * @member {number}
     */
    get textureWidth()
    {
        const texture = this._texture;

        if (texture.trim)
        {
            return texture.trim.width;
        }

        return texture.orig.width;
    }

    set textureWidth(value)  // eslint-disable-line require-jsdoc
    {
        const texture = this._texture;

        if (texture.trim)
        {
            texture.trim.width = value;
        }
        else
        {
            texture.orig.width = value;
        }
    }

    /**
     * Set the height of the texture's real size
     *
     * @member {number}
     */
    get textureHeight()
    {
        const texture = this._texture;

        if (texture.trim)
        {
            return texture.trim.height;
        }

        return texture.orig.height;
    }

    set textureHeight(value)  // eslint-disable-line require-jsdoc
    {
        const texture = this._texture;

        if (texture.trim)
        {
            texture.trim.height = value;
        }
        else
        {
            texture.orig.height = value;
        }
    }

}
