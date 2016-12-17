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
        this.root = root;

        this.canvas = renderer.view;
        this.webgl = renderer.type === RENDERER_TYPE.WEBGL;
        this.renderCore = this.webgl ? this.renderWebGLCore : this.renderCanvasCore;

        this.initBlendModes();

        this.defaultTransform = {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            alpha: 1,
            originalX: 0,
            originalY: 0,
            blend: this.blendModes.normal,
        };

        this.reset();
    }

    initBlendModes()
    {
        this.blendModes = {};
        for (const name in BLEND_MODES)
        {
            this.blendModes[name] = BLEND_MODES[name];
            this.blendModes[name.toLowerCase()] = BLEND_MODES[name];
        }
        this.blendModes.LIGHTER = BLEND_MODES.LIGHTEN;
        this.blendModes.lighter = BLEND_MODES.LIGHTEN;
        this.blendModes.DARKER = BLEND_MODES.DARKEN;
        this.blendModes.darker = BLEND_MODES.DARKEN;

        // const gl = this.renderer.gl;
        // this.compositeOperations = {
        //     'source-over': [gl.ONE, gl.ONE_MINUS_SRC_ALPHA, 1],
        //     lighter: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA, 0],
        //     lighten: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA, 0],
        //     darker: [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, 1],
        //     darken: [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, 1],
        //     'destination-out': [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, 1],
        //     'destination-over': [gl.ONE_MINUS_DST_ALPHA, gl.ONE, 1],
        //     'source-atop': [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA, 1],
        //     xor: [gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA, 1],
        //     copy: [gl.ONE, gl.ZERO, 1],
        //     'source-in': [gl.DST_ALPHA, gl.ZERO, 1],
        //     'destination-in': [gl.ZERO, gl.SRC_ALPHA, 1],
        //     'source-out': [gl.ONE_MINUS_DST_ALPHA, gl.ZERO, 1],
        //     'destination-atop': [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA, 1],
        // };
    }

    noop()
    {
        // noop;
    }

    reset()
    {
        this._renderCore = this.renderCore;
        this._lastRenderTexture = -1;

        this._lastTransformSN = -1;
        this._transformSN = 1;

        this.baseTexturePool = this.baseTexturePool || {};
        this.texturePool = this.texturePool || {};

        this.root = this.root || new Container();

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
        const Me = this;

        Me.renderer.resize(x - 1, y);
        setTimeout(function () {
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

    setOriginal(x, y)
    {
        this.globalTransform.originalX = x;
        this.globalTransform.originalY = y;
        this._transformSN++;
    }

    getAlpha()
    {
        return this.globalTransform.alpha;
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

    setBlendByName(name)
    {
        this.setBlend(this.blendModes[name] || 0);
    }

    getBlend()
    {
        return this.globalTransform.blend;
    }

    setBlend(blend)
    {
        this._lastBlend = this.globalTransform.blend;
        this.globalTransform.blend = blend;
        this._transformSN++;
    }

    restoreBlend()
    {
        this.globalTransform.blend = this._lastBlend;
        this._transformSN++;
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
        this.unlinkAllDisplayObjects(destroyChildren);
        this.shape = new Graphics();
        this.linkDisplayObject(this.shape);

        this.transformStack = [];
        this.globalTransform = {};
        for (const p in this.defaultTransform) {
            this.globalTransform[p] = this.defaultTransform[p];
        }
        this._lastBlend = this.globalTransform.blend;
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
        if (displayObject._linkedContext !== true)
        {
            this.globalContainer.addChild(displayObject);
            displayObject._linkedContext = true;
        }
        return this;
    }

    unlinkDisplayObject(displayObject, toDestroy)
    {
        if (displayObject._linkedContext !== false)
        {
            this.globalContainer.removeChild(displayObject);
            displayObject._linkedContext = false;
            if (toDestroy)
            {
                displayObject.destroy(toDestroy);
            }
        }
        return this;
    }

    unlinkAllDisplayObjects(toDestroy)
    {
        const container = this.globalContainer;
        const oldChildren = container.removeChildren(0, container.children.length);

        if (toDestroy)
        {
            for (let i = 0; i < oldChildren.length; ++i)
            {
                const child = oldChildren[i];

                child._linkedContext = false;
                child.destroy(toDestroy);
            }
        }
        return this;
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

        // no point rendering if our context has been blown up!
        if (!renderer.gl || renderer.gl.isContextLost())
        {
            this.renderCore = this.noop;
            return;
        }
        this.renderCore = this._renderCore;
        this._lastRenderTexture = -1;

        renderer._nextTextureLocation = 0;

        // if (renderer.currentRenderer.size > 1) {
        renderer.currentRenderer.start();
        // }
    }

    clear(clearColor)
    {
        this.renderer.clear(clearColor);
    }

    renderWebGLCore(displayObject, renderTexture, skipUpdateTransform)
    {
        const renderer = this.renderer;

        // can be handy to know!
        renderer.renderingToScreen = !renderTexture;

        // renderer._nextTextureLocation = 0;

        if (!renderTexture)
        {
            renderer._lastObjectRendered = displayObject;
        }
        if (renderTexture !== this._lastRenderTexture)
        {
            this._lastRenderTexture = renderTexture;
            renderer.bindRenderTexture(renderTexture, null);
        }

        if (!skipUpdateTransform)
        {
            displayObject.updateTransformWithParent(true);
        }

        // const batched = renderer.currentRenderer.size > 1;

        // if (!batched) {
        //     renderer.currentRenderer.start();
        // }

        displayObject.renderWebGL(renderer);

        // apply transform..
        // if (!batched) {
        //     renderer.currentRenderer.flush();
        // }
    }

    renderCanvasCore(displayObject, renderTexture, skipUpdateTransform)
    {
        const renderer = this.renderer;

        if (!renderer.view) {
            return;
        }
        if (!skipUpdateTransform) {
            displayObject.updateTransformWithParent();
        }
        renderer.render(displayObject, renderTexture, false, null, true);
    }

    flush()
    {
        this.renderer.currentRenderer.flush();
    }

    end()
    {
        const renderer = this.renderer;

        if (this.renderCore !== this.noop)
        {
            // if (renderer.currentRenderer.size > 1) {
            renderer.currentRenderer.flush();
            // }
            if (renderer.textureGC) {
                renderer.textureGC.update();
            }
        }
        renderer.emit('postrender');
    }

    clearRect(x, y, width, height, color, alpha)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color || 0x000000, alpha !== undefined ? alpha : 0);
        this.drawShapeRect(shape, x, y, width, height);
        shape.endFill();
        this.renderCore(shape, null, false);
    }

    strokeRect(x, y, width, height, color, lineWidth)
    {
        const shape = this.shape;

        shape.clear();
        shape.lineStyle(lineWidth, color);
        this.drawShapeRect(shape, x, y, width, height);
        this.renderCore(shape, null, false);
    }

    fillRect(x, y, width, height, color)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color);
        this.drawShapeRect(shape, x, y, width, height);
        shape.endFill();
        this.renderCore(shape, null, false);
        // shape._spriteRect = null;
    }

    drawShapeRect(shape, x, y, width, height)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originalX;
        const dy = y - t.originalY;

        shape.mask = this.mask;
        shape.drawRect(dx, dy, width, height);
    }

    strokeCircle(x, y, radius, color, lineWidth)
    {
        const shape = this.shape;

        shape.clear();
        shape.lineStyle(lineWidth, color);
        this.drawShapeCircle(shape, x, y, radius);
        this.renderCore(shape, null, false);
    }

    fillCircle(x, y, radius, color)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color);
        this.drawShapeCircle(shape, x, y, radius);
        shape.endFill();
        this.renderCore(shape, null, false);
    }

    drawShapeCircle(shape, x, y, radius)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originalX;
        const dy = y - t.originalY;

        shape.mask = this.mask;
        shape.drawCircle(dx, dy, radius);
    }

    strokeArc(x, y, radius, startAngle, endAngle, anticlockwise, color, lineWidth)
    {
        const shape = this.shape;

        shape.clear();
        shape.lineStyle(lineWidth, color);
        this.drawShapeArc(shape, x, y, radius, startAngle, endAngle, anticlockwise);
        this.renderCore(shape, null, false);
    }

    fillArc(x, y, radius, startAngle, endAngle, anticlockwise, color)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color);
        this.drawShapeArc(shape, x, y, radius, startAngle, endAngle, anticlockwise);
        shape.endFill();
        this.renderCore(shape, null, false);
    }

    drawShapeArc(shape, x, y, radius, startAngle, endAngle, anticlockwise)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originalX;
        const dy = y - t.originalY;

        shape.mask = this.mask;
        shape.arc(dx, dy, radius, startAngle, endAngle, anticlockwise);
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

            const position = displayObject.position;

            dx = position.x;
            dy = position.y;
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
        } else if (count >= 7) {
            // dx, dy
            if (displayObject._width !== sw) {
                displayObject.width = sw;
            }
            if (displayObject._height !== sh) {
                displayObject.height = sh;
            }
            renderTexture = dw;
        } else if (count >= 5) {
            if (displayObject._width !== sw) {
                displayObject.width = sw;
            }
            if (displayObject._height !== sh) {
                displayObject.height = sh;
            }
            renderTexture = dx;

            const position = displayObject.position;

            dx = position.x;
            dy = position.y;
        }

        const t = this.globalTransform;
        const x = dx - t.originalX;
        const y = dy - t.originalY;

        displayObject.transform.position.set(x, y);

        displayObject.mask = this.mask;

        this.renderCore(displayObject, renderTexture, false);
    }

    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
    {
        const count = arguments.length;
        let sprite;

        if (count === 9) {
            sprite = this.createSprite(image, sx, sy, sw, sh, true);
            this.render(sprite, dx, dy, dw, dh);
        } else if (count === 5) {
            sprite = this.createSprite(image, 0, 0, image.width, image.height, true);
            // dx, dy, dw, dh
            this.render(sprite, sx, sy, sw, sh);
        } else {
            sprite = this.createSprite(image, 0, 0, image.width, image.height, true);
            // dx, dy
            this.renderAt(sprite, sx, sy);
        }
        this.unlinkDisplayObject(sprite);
    }

    drawImageAt(image, dx, dy)
    {
        const sprite = this.createSprite(image, 0, 0, image.width, image.height, true);

        this.renderAt(sprite, dx, dy);
        this.unlinkDisplayObject(sprite);
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
        let texture;

        if (count === 2) {
            id = sx;
        }
        if (id) {
            texture = this.texturePool[id];
            if (texture) {
                return texture;
            }
        }

        const rect = sw && sh ? new Rectangle(sx, sy, sw, sh) : null;

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

    destroy()
    {
        this._lastRenderTexture = -1;
        this.baseTexturePool = null;
        this.texturePool = null;
        this.renderer = null;
        this.canvas = null;
        this.root.destroy(true);
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
