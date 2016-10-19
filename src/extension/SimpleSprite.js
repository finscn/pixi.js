import * as core from '../core';

const math = core.math;
const utils = core.utils;
const Texture = core.Texture;
const DisplayObject = core.DisplayObject;
const tempPoint = new math.Point();


export default class SimpleSprite extends core.Sprite
{

    // constructor(texture)
    // {
    //     super(texture);
    // }

    updateTransform()
    {
        this._boundsID++;

        if (!this.visible) {
            return;
        }

        this.transform.updateTransform(this.parent.transform);

        //TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    }

    renderWebGL(renderer)
    {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || this._filters) {
            this.renderAdvancedWebGL(renderer);
        } else {
            this._renderWebGL(renderer);
        }
    }

    renderAdvancedWebGL(renderer)
    {
        renderer.currentRenderer.flush();

        const filters = this._filters;
        const mask = this._mask;
        let i;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters) {
            if (!this._enabledFilters) {
                this._enabledFilters = [];
            }

            this._enabledFilters.length = 0;

            for (i = 0; i < filters.length; i++) {
                if (filters[i].enabled) {
                    this._enabledFilters.push(filters[i]);
                }
            }

            if (this._enabledFilters.length) {
                renderer.filterManager.pushFilter(this, this._enabledFilters);
            }
        }

        if (mask) {
            renderer.maskManager.pushMask(this, this._mask);
        }

        renderer.currentRenderer.start();

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);

        renderer.currentRenderer.flush();

        if (mask) {
            renderer.maskManager.popMask(this, this._mask);
        }

        if (filters && this._enabledFilters && this._enabledFilters.length) {
            renderer.filterManager.popFilter();
        }

        renderer.currentRenderer.start();
    }


    renderCanvas(renderer)
    {
        // if not visible or the alpha is 0 then no need to render this
        if (!this.visible || this.alpha <= 0 || !this.renderable) {
            return;
        }

        if (this._mask) {
            renderer.maskManager.pushMask(this._mask);
        }

        this._renderCanvas(renderer);

        if (this._mask) {
            renderer.maskManager.popMask(renderer);
        }
    }


    calculateBounds()
    {
        this._bounds.clear();

        if (!this.visible) {
            return;
        }

        this._calculateBounds();

        this._boundsID = this._lastBoundsID;
    }


    getLocalBounds(rect)
    {
        this._bounds.minX = -this._texture.orig.width * this.anchor._x;
        this._bounds.minY = -this._texture.orig.height * this.anchor._y;
        this._bounds.maxX = this._texture.orig.width;
        this._bounds.maxY = this._texture.orig.height;

        if (!rect) {
            if (!this._localBoundsRect) {
                this._localBoundsRect = new math.Rectangle();
            }

            rect = this._localBoundsRect;
        }

        return this._bounds.getRectangle(rect);
    }


    containsPoint(point)
    {
        this.worldTransform.applyInverse(point, tempPoint);

        const width = this._texture.orig.width;
        const height = this._texture.orig.height;
        const x1 = -width * this.anchor.x;
        let y1;

        if (tempPoint.x > x1 && tempPoint.x < x1 + width) {
            y1 = -height * this.anchor.y;

            if (tempPoint.y > y1 && tempPoint.y < y1 + height) {
                return true;
            }
        }

        return false;
    }


    destroy(options)
    {
        DisplayObject.prototype.destroy.call(this, options);

        this.anchor = null;

        const destroyTexture = typeof options === 'boolean' ? options : options && options.texture;
        if (destroyTexture) {
            const destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;
            this._texture.destroy(!!destroyBaseTexture);
        }

        this._texture = null;
        this.shader = null;
    }

    // some helper functions..

    static from(source)
    {
        return new SimpleSprite(Texture.from(source));
    }

    static fromFrame(frameId)
    {
        const texture = utils.TextureCache[frameId];

        if (!texture) {
            throw new Error('The frameId "' + frameId + '" does not exist in the texture cache');
        }

        return new SimpleSprite(texture);
    }

    static fromImage(imageId, crossorigin, scaleMode)
    {
        return new SimpleSprite(Texture.fromImage(imageId, crossorigin, scaleMode));
    }

}
