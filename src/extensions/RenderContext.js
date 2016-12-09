import * as core from '../core';
import * as mesh from '../mesh';
import { RENDERER_TYPE, BLEND_MODES } from '../core/const';

const BaseTexture = core.BaseTexture;
const Texture = core.Texture;
const Container = core.Container;
const Sprite = core.Sprite;
const Graphics = core.Graphics;
const Rectangle = core.Rectangle;

export default class RenderContext
{
    constructor(renderer, root)
    {
        this.renderer = renderer;
        this.canvas = renderer.view;
        this.webgl = renderer.type === RENDERER_TYPE.WEBGL;

        this._lastTransformSN = -1;
        this._transformSN = 1;

        this.baseTexturePool = this.baseTexturePool || {};
        this.texturePool = this.texturePool || {};

        this.defaultTransform = {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            alpha: 1,
            originalX: 0,
            originalY: 0,
            blend: BLEND_MODES.NORMAL,
        };

        this.root = root || new Container();

        this.maskContainer = new Container();
        this.maskContainer.visible = false;
        this.root.addChild(this.maskContainer);
        this.maskShape = new Graphics();
        this.maskContainer.addChild(this.maskShape);

        this.globalContainer = new Container();
        this.globalContainer.visible = false;
        this.root.addChild(this.globalContainer);

        this.resetGlobalContainer(false);
    }

    resize(x, y)
    {
        this.renderer.resize(x - 1, y);
        const Me = this;
        setTimeout(function() {
            Me.renderer.resize(x, y);
        }, 1);
    }

    colorRgb(r, g, b)
    {
        return (r << 16) + (g << 8) + b;
    }

    colorHex(value)
    {
        return parseInt(value.substr(-6), 16);
    }

    colroName(value)
    {
        // TODO
        return value;
    }

    /**
     *
     *
     *
     *
     *
     *
     **/

    save()
    {
        const t = this.globalTransform;
        this.transformStack.push({
            x: t.x,
            y: t.y,
            scaleX: t.scaleX,
            scaleY: t.scaleY,
            rotation: t.rotation,
            alpha: t.alpha,
            originalX: t.originalX,
            originalY: t.originalY,
            blend: t.blend,
        });
    }

    restore()
    {
        const lt = this.transformStack.pop();
        if (!lt) {
            return;
        }
        const t = this.globalTransform;
        t.x = lt.x;
        t.y = lt.y;
        t.scaleX = lt.scaleX;
        t.scaleY = lt.scaleY;
        t.rotation = lt.rotation;
        t.alpha = lt.alpha;
        t.originalX = lt.originalX;
        t.originalY = lt.originalY;
        t.blend = lt.blend;
        this._transformSN++;
    }

    translate(x, y)
    {
        this.globalTransform.x += x;
        this.globalTransform.y += y;
        this._transformSN++;
    }

    scale(x, y)
    {
        this.globalTransform.scaleX *= x;
        this.globalTransform.scaleY *= y;
        this._transformSN++;
    }

    rotate(rotation)
    {
        this.globalTransform.rotation += rotation;
        this._transformSN++;
    }

    setAlpha(alpha)
    {
        this._lastAlpha = this.globalTransform.alpha;
        this.globalTransform.alpha = alpha === undefined ? 1 : alpha;
        this._transformSN++;
    }

    restoreAlpha()
    {
        this.globalTransform.alpha = this._lastAlpha;
        this._transformSN++;
    }

    getAlpha()
    {
        return this.globalTransform.alpha;
    }

    setOriginal(x, y)
    {
        this.globalTransform.originalX = x;
        this.globalTransform.originalY = y;
        this._transformSN++;
    }

    setBlend(blend)
    {
        this.globalTransform.blend = blend;
        this._transformSN++;
    }

    getBlend()
    {
        return this.globalTransform.blend;
    }

    updateClipRect(x, y, width, height)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originalX;
        const dy = y - t.originalY;

        this.maskShape.clear();
        this.maskShape.updateTransform();
        this.maskShape.beginFill(0x000000);
        this.maskShape.drawRect(dx, dy, width, height);
        this.maskShape.endFill();
    }

    clipRect(x, y, width, height)
    {
        this.updateClipRect(x, y, width, height);
        this.mask = this.maskShape;
    }

    unclipRect()
    {
        this.mask = null;
    }

    resetGlobalContainer(destroyChildren)
    {
        this.globalContainer.removeAllChildren(destroyChildren);
        this.shape = new Graphics();
        this.globalContainer.addChild(this.shape);

        this.transformStack = [];
        this.globalTransform = {};
        for (const p in this.defaultTransform) {
            this.globalTransform[p] = this.defaultTransform[p];
        }
        this._lastAlpha = this.globalTransform.alpha;
        this.updateGlobalContainer(true);
    }

    updateGlobalContainer(force)
    {
        if (force !== true && this._lastTransformSN === this._transformSN) {
            return;
        }
        this._lastTransformSN = this._transformSN;
        const t = this.globalTransform;
        const ct = this.globalContainer.transform;
        ct.position.set(t.x + t.originalX, t.y + t.originalY);
        ct.scale.set(t.scaleX, t.scaleY);
        ct.rotation = t.rotation;
        this.globalContainer.alpha = t.alpha;
        this.globalContainer.blendMode = t.blend || BLEND_MODES.NORMAL;
        this.globalContainer.updateTransformWithParent();
    }

    updateRootContainer()
    {
        this.root.updateTransformWithParent();
        this._transformSN++;
    }

    linkDisplayObject(displayObject)
    {
        this.globalContainer.addChild(displayObject);
    }

    unlinkDisplayObject(displayObject)
    {
        this.globalContainer.removeChild(displayObject);
    }

    /**
     *
     *
     *
     *
     *
     *
     **/

    begin(clear)
    {
        if (clear) {
            this.clear();
        }
        const renderer = this.renderer;

        renderer.emit('prerender');

        if (renderer.currentRenderer.size > 1) {
            renderer.currentRenderer.start();
        }
    }

    clear(clearColor)
    {
        const renderer = this.renderer;
        if (renderer._activeRenderTarget) {
            renderer.clear(clearColor);
        }
    }

    renderCore(displayObject, renderTexture, skipUpdateTransform)
    {
        const renderer = this.renderer;

        if (!this.webgl) {
            if (!renderer.view) {
                return;
            }
            if (!skipUpdateTransform) {
                displayObject.updateTransformWithParent();
            }
            renderer.render(displayObject, renderTexture, false, null, true);
            return;
        }

        // can be handy to know!
        renderer.renderingToScreen = !renderTexture;

        // no point rendering if our context has been blown up!
        if (!renderer.gl || renderer.gl.isContextLost())
        {
            return;
        }

        renderer._nextTextureLocation = 0;

        if (!renderTexture)
        {
            renderer._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            displayObject.updateTransformWithParent(true);
        }

        renderer.bindRenderTexture(renderTexture, null);

        const batched = renderer.currentRenderer.size > 1;

        if (!batched) {
            renderer.currentRenderer.start();
        }

        displayObject.renderWebGL(renderer);

        // apply transform..
        if (!batched) {
            renderer.currentRenderer.flush();
        }
    }

    flush()
    {
        const renderer = this.renderer;
        if (renderer.currentRenderer.size > 1) {
            renderer.currentRenderer.flush();
        }
    }

    end()
    {
        this.flush();
        const renderer = this.renderer;
        if (renderer.textureGC) {
            renderer.textureGC.update();
        }
        renderer.emit('postrender');
    }

    strokeRect(x, y, width, height, color, lineWidth)
    {
        this.shape.clear();
        this.shape.lineStyle(lineWidth, color);
        this.drawShapeRect(x, y, width, height);
        this.renderCore(this.shape, null, false);
    }

    fillRect(x, y, width, height, color)
    {
        this.shape.clear();
        this.shape.beginFill(color);
        this.drawShapeRect(x, y, width, height);
        this.shape.endFill();
        this.renderCore(this.shape, null, false);
    }

    clearRect(x, y, width, height, color, alpha)
    {
        this.shape.clear();
        this.shape.beginFill(color || 0x000000, alpha !== undefined ? alpha : 0);
        this.drawShapeRect(x, y, width, height);
        this.shape.endFill();
        this.renderCore(this.shape, null, false);
    }

    drawShapeRect(x, y, width, height)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originalX;
        const dy = y - t.originalY;

        this.shape.mask = this.mask;
        this.shape.drawRect(dx, dy, width, height);
    }

    strokeArc(x, y, radius, startAngle, endAngle, anticlockwise, color, lineWidth)
    {
        this.shape.clear();
        this.shape.lineStyle(lineWidth, color);
        this.drawShapeArc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.renderCore(this.shape, null, false);
    }

    fillArc(x, y, radius, startAngle, endAngle, anticlockwise, color)
    {
        this.shape.clear();
        this.shape.beginFill(color);
        this.drawShapeArc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.shape.endFill();
        this.renderCore(this.shape, null, false);
    }

    drawShapeArc(x, y, radius, startAngle, endAngle, anticlockwise)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originalX;
        const dy = y - t.originalY;

        this.shape.mask = this.mask;
        this.shape.arc(dx, dy, radius, startAngle, endAngle, anticlockwise);
    }

    renderBasic(displayObject, renderTexture)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const position = displayObject.transform.position;
        const x = position.x;
        const y = position.y;
        position.set(x - t.originalX, y - t.originalY);

        // TODO: add mask ?
        // if (!displayObject.mask) {
        //     displayObject.mask = this.mask;
        // }

        this.renderCore(displayObject, renderTexture, false);

        position.set(x, y);
    }

    renderAt(displayObject, dx, dy, renderTexture)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const x = dx - t.originalX;
        const y = dy - t.originalY;

        displayObject.transform.position.set(x, y);

        displayObject.mask = this.mask;

        this.renderCore(displayObject, renderTexture, false);
    }

    render(displayObject, dx, dy, dw, dh, renderTexture)
    {
        const count = arguments.length;
        if (count >= 5) {
            // dx, dy, dw, dh
            if (displayObject._width !== dw) {
                displayObject.width = dw;
            }
            if (displayObject._height !== dh) {
                displayObject.height = dh;
            }
        } else if (count === 3) {
            renderTexture = dw;
            // dx, dy
        } else {
            renderTexture = dx;
            dx = 0;
            dy = 0;
        }

        this.updateGlobalContainer();

        const t = this.globalTransform;
        const x = dx - t.originalX;
        const y = dy - t.originalY;

        displayObject.transform.position.set(x, y);

        displayObject.mask = this.mask;

        this.renderCore(displayObject, renderTexture, false);
    }

    renderPart(displayObject, sx, sy, sw, sh, dx, dy, dw, dh, renderTexture)
    {
        const count = arguments.length;

        this.updateGlobalContainer();

        const t = this.globalTransform;

        const frame = displayObject._texture._frame;
        frame.x = sx;
        frame.y = sy;
        frame.width = sw;
        frame.height = sh;
        displayObject._texture._updateUvs();

        if (count >= 9) {
            // dx, dy, dw, dh
            if (displayObject._width !== dw) {
                displayObject.width = dw;
            }
            if (displayObject._height !== dh) {
                displayObject.height = dh;
            }
            displayObject.transform.position.set(dx - t.originalX, dy - t.originalY);
        } else if (count >= 7) {
            // dx, dy
            if (displayObject._width !== sw) {
                displayObject.width = sw;
            }
            if (displayObject._height !== sh) {
                displayObject.height = sh;
            }
            renderTexture = dw;
            displayObject.transform.position.set(dx - t.originalX, dy - t.originalY);
        } else if (count >= 5) {
            if (displayObject._width !== sw) {
                displayObject.width = sw;
            }
            if (displayObject._height !== sh) {
                displayObject.height = sh;
            }
            renderTexture = dx;
            displayObject.transform.position.set(-t.originalX, -t.originalY);
        }

        displayObject.mask = this.mask;

        this.renderCore(displayObject, renderTexture, false);
    }

    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
    {
        const count = arguments.length;
        let sprite;
        if (count === 9) {
            sprite = this.createSprite(image, sx, sy, sw, sh);
            this.render(sprite, dx, dy, dw, dh);
        } else if (count === 5) {
            sprite = this.createSprite(image, 0, 0, image.width, image.height);
            // dx, dy, dw, dh
            this.render(sprite, sx, sy, sw, sh);
        } else {
            sprite = this.createSprite(image, 0, 0, image.width, image.height);
            // dx, dy
            this.renderAt(sprite, sx, sy);
        }
    }

    drawImageAt(image, dx, dy)
    {
        const sprite = this.createSprite(image, 0, 0, image.width, image.height);
        this.renderAt(sprite, dx, dy);
    }

    /**
     *
     *
     *
     *
     *
     *
     **/

    createBaseTexture(image)
    {
        const id = image.id || image.src;
        let baseTexture;
        if (id) {
            baseTexture = this.baseTexturePool[id];
            if (!baseTexture) {
                baseTexture = new BaseTexture(image);
                this.baseTexturePool[id] = baseTexture;
            }
        } else {
            baseTexture = new BaseTexture(image);
        }
        return baseTexture;
    }

    createTexture(image, sx, sy, sw, sh, id)
    {
        const count = arguments.length;
        const baseTexture = this.createBaseTexture(image);
        if (count === 2) {
            id = sx;
        }
        let texture;
        if (id) {
            texture = this.texturePool[id];
            if (texture) {
                return texture;
            }
        }
        let rect;
        if (count > 2) {
            rect = new Rectangle(sx, sy, sw, sh);
        }
        texture = new Texture(baseTexture, rect);
        if (id) {
            this.texturePool[id] = texture;
        }
        return texture;
    }

    createSprite(image, sx, sy, sw, sh, container)
    {
        const count = arguments.length;
        let id;
        let texture;
        if (count > 2) {
            // id = [image.id || image.src, sx, sy, sw, sh].join('-');
            texture = this.createTexture(image, sx, sy, sw, sh, id);
        } else {
            container = sx;
            // id = image.id || image.src;
            texture = this.createTexture(image, id);
        }
        const sprite = Sprite.from(texture);
        if (container) {
            if (container === true) {
                container = this.globalContainer;
            }
            container.addChild(sprite);
        }
        return sprite;
    }

    createNineSliceObject(image, sx, sy, sw, sh, L, T, R, B, container)
    {
        const count = arguments.length;
        let id;
        let texture;
        if (count >= 9) {
            // id = [image.id || image.src, sx, sy, sw, sh].join('-');
            texture = this.createTexture(image, sx, sy, sw, sh, id);
        } else {
            // id = image.id || image.src;
            texture = this.createTexture(image, id);
            if (count === 6) {
                container = L;
            }
            L = sx;
            T = sy;
            R = sw;
            B = sh;
        }
        const sprite = new mesh.NineSlicePlane(texture, L, T, R, B);
        if (container) {
            if (container === true) {
                container = this.globalContainer;
            }
            container.addChild(sprite);
        }
        return sprite;
    }

    createTextObject(context, container)
    {
        const canvas = context.canvas;
        const texture = Texture.fromCanvas(canvas);
        texture.orig = new Rectangle();
        texture.trim = new Rectangle();
        const sprite = Sprite.from(texture);
        sprite.resolution = this.renderer.resolution;
        sprite.context = context;
        sprite.canvas = canvas;
        sprite.padding = 0;
        sprite.updateSize = this._updateTextSize;
        sprite.updateContent = this._updateTextContent;

        if (container) {
            if (container === true) {
                container = this.globalContainer;
            }
            container.addChild(sprite);
        }
        return sprite;
    }

    _updateTextContent()
    {
        const texture = this._texture;
        this._textureID = -1;
        texture.baseTexture.emit('update', texture.baseTexture);
    }

    _updateTextSize()
    {
        const texture = this._texture;

        texture.baseTexture.hasLoaded = true;
        texture.baseTexture.resolution = this.resolution;
        texture.baseTexture.realWidth = this.canvas.width;
        texture.baseTexture.realHeight = this.canvas.height;
        texture.baseTexture.width = this.canvas.width / this.resolution;
        texture.baseTexture.height = this.canvas.height / this.resolution;
        texture.trim.width = texture._frame.width = this.canvas.width / this.resolution;
        texture.trim.height = texture._frame.height = this.canvas.height / this.resolution;

        texture.trim.x = -this.padding;
        texture.trim.y = -this.padding;

        texture.orig.width = texture._frame.width - (this.padding * 2);
        texture.orig.height = texture._frame.height - (this.padding * 2);

        // call sprite onTextureUpdate to update scale if _width or _height were set
        this._onTextureUpdate();

        texture.baseTexture.emit('update', texture.baseTexture);
    }
}
