import * as core from '../core';

const Texture = core.Texture;
const Rectangle = core.Rectangle;
const TextureCache = core.utils.TextureCache;

export default class LeafSprite extends core.Sprite
{
    updateTransform()
    {
        this._boundsID++;

        this.transform.updateTransform(this.parent.transform);

        // TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    }

    renderWebGL(renderer)
    {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || this.filters)
        {
            this.renderAdvancedWebGL(renderer);
        }
        else
        {
            this._renderWebGL(renderer);
        }
    }

    renderAdvancedWebGL(renderer)
    {
        renderer.flush();

        const filters = this.filters;
        const mask = this._mask;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters)
        {
            if (!this._enabledFilters)
            {
                this._enabledFilters = [];
            }

            this._enabledFilters.length = 0;

            for (let i = 0; i < filters.length; i++)
            {
                if (filters[i].enabled)
                {
                    this._enabledFilters.push(filters[i]);
                }
            }

            if (this._enabledFilters.length)
            {
                renderer.filterManager.pushFilter(this, this._enabledFilters);
            }
        }

        if (mask)
        {
            renderer.maskManager.pushMask(this, this._mask);
        }

        // add this object to the batch, only rendered if it has a texture.
        this._renderWebGL(renderer);

        renderer.flush();

        if (mask)
        {
            renderer.maskManager.popMask(this, this._mask);
        }

        if (filters && this._enabledFilters && this._enabledFilters.length)
        {
            renderer.filterManager.popFilter();
        }
    }

    renderCanvas(renderer)
    {
        // if not visible or the alpha is 0 then no need to render this
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        if (this._mask)
        {
            renderer.maskManager.pushMask(this._mask);
        }

        this._renderCanvas(renderer);

        if (this._mask)
        {
            renderer.maskManager.popMask(renderer);
        }
    }

    calculateBounds()
    {
        this._bounds.clear();

        const trim = this._texture.trim;
        const orig = this._texture.orig;

        // First lets check to see if the current texture has a trim..
        if (!trim || (trim.width === orig.width && trim.height === orig.height))
        {
            // no trim! lets use the usual calculations..
            this.calculateVertices();
            this._bounds.addQuad(this.vertexData);
        }
        else
        {
            // lets calculate a special trimmed bounds...
            this.calculateTrimmedVertices();
            this._bounds.addQuad(this.vertexTrimmedData);
        }

        this._boundsID = this._lastBoundsID;
    }

    getLocalBounds(rect)
    {
        this._bounds.minX = this._texture.orig.width * -this._anchor._x;
        this._bounds.minY = this._texture.orig.height * -this._anchor._y;
        this._bounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
        this._bounds.maxY = this._texture.orig.height * (1 - this._anchor._x);

        if (!rect)
        {
            if (!this._localBoundsRect)
            {
                this._localBoundsRect = new Rectangle();
            }

            rect = this._localBoundsRect;
        }

        return this._bounds.getRectangle(rect);
    }

    // some helper functions..

    static from(source)
    {
        return new LeafSprite(Texture.from(source));
    }

    static fromFrame(frameId)
    {
        const texture = TextureCache[frameId];

        if (!texture)
        {
            throw new Error(`The frameId "${frameId}" does not exist in the texture cache`);
        }

        return new LeafSprite(texture);
    }

    static fromImage(imageId, crossorigin, scaleMode)
    {
        return new LeafSprite(Texture.fromImage(imageId, crossorigin, scaleMode));
    }

}
