import * as core from '../core';
import * as mesh from '../mesh';
import * as particles from '../particles';
import CanvasRenderTarget from '../core/renderers/canvas/utils/CanvasRenderTarget';
import { RENDERER_TYPE, BLEND_MODES } from '../core/const';

const BaseTexture = core.BaseTexture;
const Texture = core.Texture;
const Container = core.Container;
const Sprite = core.Sprite;
const Graphics = core.Graphics;
const Rectangle = core.Rectangle;
const Text = core.Text;
const ParticleContainer = particles.ParticleContainer;

export default class RenderContext
{
    constructor(renderer, root)
    {
        this.renderer = renderer;
        this.root = root;

        this.canvas = renderer.view;
        this.webgl = renderer.type === RENDERER_TYPE.WEBGL;

        this.begin = this.webgl ? this.beginWebGL : this.beginCanvas;
        this.renderCore = this.webgl ? this.renderCoreWebGL : this.renderCoreCanvas;
        this.end = this.webgl ? this.endWebGL : this.endCanvas;

        this.initBlendModes();

        this.defaultTransform = {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            alpha: 1,
            originX: 0,
            originY: 0,
            lineWidth: 1,
            strokeColor: 0x000000,
            fillColor: 0x000000,
            // blend: this.blendModes.normal,
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
        this._lastRenderTexture = null;
        this._renderingToScreen = true;

        this._lastTransformSN = -1;
        this._transformSN = 1;

        this.blend = null;
        this._lastBlend = null;

        this.mask = null;
        this.renderTexture = null;

        this.baseTexturePool = this.baseTexturePool || {};
        this.texturePool = this.texturePool || {};

        this.root = this.root || new Container();

        this.globalContainer = new Container();
        this.globalContainer.visible = false;
        this.root.addChild(this.globalContainer);

        this.maskContainer = new Container();
        this.maskContainer.visible = false;
        this.root.addChild(this.maskContainer);
        this.maskShape = new Graphics();
        this.maskContainer.addChild(this.maskShape);

        this.resetGlobalContainer(false);
    }

    resize(x, y)
    {
        const Me = this;

        Me.renderer.resize(x - 1, y);
        setTimeout(function ()
        {
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

    beginWebGL(clear)
    {
        if (!this._renderingToScreen)
        {
            this.renderer.flush();
            this.renderer.bindRenderTexture();
            this._renderingToScreen = true;
        }

        if (clear)
        {
            this.clear();
        }

        this.mask = null;
        this.renderTexture = null;

        const renderer = this.renderer;

        renderer.emit('prerender');

        // no point rendering if our context has been blown up!
        if (!renderer.gl || renderer.gl.isContextLost())
        {
            this.renderCore = this.noop;

            return;
        }
        this.renderCore = this._renderCore;

        renderer._nextTextureLocation = 0;

        // if (renderer.currentRenderer.size > 1)
        // {
        renderer.currentRenderer.start();
        // }
    }

    renderCoreWebGL(displayObject, renderTexture, clear, skipUpdateTransform)
    {
        if (this.blend !== null)
        {
            // TODO
            // displayObject.blendMode = this.blend;
        }

        if (renderTexture === undefined)
        {
            renderTexture = this.renderTexture;
        }

        const renderer = this.renderer;
        const renderTextureChanged = renderTexture !== this._lastRenderTexture;

        // if (renderTextureChanged && !renderTexture)
        if (renderTextureChanged)
        {
            renderer.currentRenderer.flush();

            // renderer.emit('postrender');
        }

        // can be handy to know!
        renderer.renderingToScreen = !renderTexture;
        // renderer._nextTextureLocation = 0;

        if (renderer.renderingToScreen)
        {
            renderer._lastObjectRendered = displayObject;
        }

        if (renderTextureChanged)
        {
            // renderer.emit('prerender');

            renderer._nextTextureLocation = 0;

            renderer.bindRenderTexture(renderTexture, null);
            renderer.currentRenderer.start();
        }

        if (renderTexture && clear)
        {
            renderer._activeRenderTarget.clear();
        }

        if (!skipUpdateTransform)
        {
            displayObject.updateTransformWithParent(true);
        }

        // const batched = renderer.currentRenderer.size > 1;

        // if (!batched)
        // {
        //     renderer.currentRenderer.start();
        // }

        displayObject.renderWebGL(renderer);

        this._lastRenderTexture = renderTexture;
        this._renderingToScreen = renderer.renderingToScreen;

        // apply transform..
        // if (!batched)
        // {
        //     renderer.currentRenderer.flush();
        // }
    }

    endWebGL()
    {
        const renderer = this.renderer;

        if (this.renderCore !== this.noop)
        {
            // if (renderer.currentRenderer.size > 1)
            // {
            renderer.currentRenderer.flush();
            // }
            if (renderer.textureGC)
            {
                renderer.textureGC.update();
            }

            if (!this._renderingToScreen)
            {
                this.renderer.bindRenderTexture();
                this._renderingToScreen = true;
            }
        }
        renderer.emit('postrender');
    }

    beginCanvas(clear)
    {
        this._renderingToScreen = true;
        if (clear)
        {
            this.clear();
        }

        this.mask = null;
        this.renderTexture = null;

        const renderer = this.renderer;

        renderer.emit('prerender');
    }

    renderCoreCanvas(displayObject, renderTexture, clear, skipUpdateTransform)
    {
        if (this.blend !== null)
        {
            // TODO
            // displayObject.blendMode = this.blend;
        }

        const renderer = this.renderer;

        if (!renderer.view)
        {
            return;
        }

        // can be handy to know!
        renderer.renderingToScreen = !renderTexture;

        const rootResolution = renderer.resolution;

        if (renderTexture)
        {
            renderTexture = renderTexture.baseTexture || renderTexture;

            if (!renderTexture._canvasRenderTarget)
            {
                renderTexture._canvasRenderTarget = new CanvasRenderTarget(
                    renderTexture.width,
                    renderTexture.height,
                    renderTexture.resolution
                );
                renderTexture.source = renderTexture._canvasRenderTarget.canvas;
                renderTexture.valid = true;
            }

            renderer.context = renderTexture._canvasRenderTarget.context;
            renderer.resolution = renderTexture._canvasRenderTarget.resolution;
        }
        else
        {
            renderer.context = renderer.rootContext;
        }

        const context = renderer.context;

        if (!renderTexture)
        {
            renderer._lastObjectRendered = displayObject;
        }

        if (!skipUpdateTransform)
        {
            displayObject.updateTransformWithParent();
        }

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        context.globalCompositeOperation = renderer.blendModes[BLEND_MODES.NORMAL];

        if (navigator.isCocoonJS && renderer.view.screencanvas)
        {
            context.fillStyle = 'black';
            context.clear();
        }

        if (clear)
        {
            if (renderer.renderingToScreen)
            {
                if (renderer.transparent)
                {
                    context.clearRect(0, 0, renderer.width, renderer.height);
                }
                else
                {
                    context.fillStyle = renderer._backgroundColorString;
                    context.fillRect(0, 0, renderer.width, renderer.height);
                }
            } // else {
            // TODO: implement background for CanvasRenderTarget or RenderTexture?
            // }
        }

        // TODO RENDER TARGET STUFF HERE..
        const tempContext = renderer.context;

        renderer.context = context;
        displayObject.renderCanvas(renderer);
        renderer.context = tempContext;

        renderer.resolution = rootResolution;
    }

    endCanvas()
    {
        const renderer = this.renderer;

        renderer.emit('postrender');
    }

    flush()
    {
        if (this.renderer.currentRenderer)
        {
            this.renderer.currentRenderer.flush();
        }
    }

    clear(clearColor)
    {
        this.renderer.clear(clearColor);
    }

    clearRenderTexture(renderTexture, clearColor)
    {
        this.renderer.clearRenderTexture(renderTexture, clearColor);
    }

    bindRenderTexture(renderTexture, transform)
    {
        this.renderer.bindRenderTexture(renderTexture, transform);
        this._lastRenderTexture = renderTexture;
    }

    /**
     *
     *
     *
     *
     *
     *
     **/

    resetGlobalContainer(destroyChildren)
    {
        this.unlinkAllDisplayObjects(destroyChildren);
        this.shape = new Graphics();
        this.linkDisplayObject(this.shape);
        this.textSprite = new Text(' ');
        this.linkDisplayObject(this.textSprite);

        this.transformStack = [];
        this.globalTransform = {};
        for (const p in this.defaultTransform)
        {
            this.globalTransform[p] = this.defaultTransform[p];
        }
        this._lastAlpha = this.globalTransform.alpha;
        // this._lastBlend = this.globalTransform.blend;
        this.updateGlobalContainer(true);
    }

    updateGlobalContainer(force)
    {
        if (force !== true && this._lastTransformSN === this._transformSN)
        {
            return;
        }
        this._lastTransformSN = this._transformSN;

        const t = this.globalTransform;
        const ct = this.globalContainer.transform;

        ct.position.set(t.x + t.originX, t.y + t.originY);
        ct.scale.set(t.scaleX, t.scaleY);
        ct.rotation = t.rotation;
        this.globalContainer.alpha = t.alpha;
        // this.globalContainer.blendMode = t.blend || BLEND_MODES.NORMAL;
        this.globalContainer.updateTransformWithParent();
    }

    updateRootContainer()
    {
        this.root.updateTransformWithParent();
        this._transformSN++;
    }

    linkDisplayObject(displayObject, force)
    {
        if (force || displayObject._linkedContext !== true)
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
            originX: t.originX,
            originY: t.originY,
            lineWidth: t.lineWidth,
            strokeColor: t.strokeColor,
            fillColor: t.fillColor,
            // blend: t.blend,
        });
    }

    restore()
    {
        const lt = this.transformStack.pop();

        if (!lt)
        {
            return;
        }

        const t = this.globalTransform;

        t.x = lt.x;
        t.y = lt.y;
        t.scaleX = lt.scaleX;
        t.scaleY = lt.scaleY;
        t.rotation = lt.rotation;
        t.alpha = lt.alpha;
        t.originX = lt.originX;
        t.originY = lt.originY;
        t.blend = lt.blend;
        t.lineWidth = lt.lineWidth;
        t.strokeColor = lt.strokeColor;
        t.fillColor = lt.fillColor;
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

    setOrigin(x, y)
    {
        this.globalTransform.originX = x;
        this.globalTransform.originY = y;
        this._transformSN++;
    }

    getOrigin()
    {
        return {
            x: this.globalTransform.originX,
            y: this.globalTransform.originY,
        };
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

    get globalAlpha()
    {
        return this.globalTransform.alpha;
    }

    set globalAlpha(value)
    {
        this.globalTransform.alpha = value;
    }

    restoreAlpha()
    {
        this.globalTransform.alpha = this._lastAlpha;
        this._transformSN++;
    }

    get lineWidth()
    {
        return this.globalTransform.lineWidth;
    }

    set lineWidth(value)
    {
        this.globalTransform.lineWidth = value;
    }

    get strokeStyle()
    {
        return this.globalTransform.strokeColor;
    }

    set strokeStyle(value)
    {
        this.globalTransform.strokeColor = value;
    }

    get fillStyle()
    {
        return this.globalTransform.fillColor;
    }

    set fillStyle(value)
    {
        this.globalTransform.fillColor = value;
    }

    setBlendByName(name)
    {
        this.setBlend(this.blendModes[name] || 0);
    }

    getBlend()
    {
        // return this.globalTransform.blend;
        return this.blend;
    }

    setBlend(blend)
    {
        this._lastBlend = this.blend;
        this.blend = blend;

        // this.globalTransform.blend = blend;
        // this._transformSN++;
    }

    restoreBlend()
    {
        this.blend = this._lastBlend;

        // this.globalTransform.blend = this._lastBlend;
        // this._transformSN++;
    }

    updateClipRect(x, y, width, height)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originX;
        const dy = y - t.originY;

        this.maskContainer.updateTransform();
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

    /**
     *
     *
     *
     *
     *
     *
     **/

    clearRect(x, y, width, height, color, alpha)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color || 0x000000, alpha !== undefined ? alpha : 0);
        this.drawShapeRect(shape, x, y, width, height);
        shape.endFill();
        this.renderCore(shape, undefined, false, false);
    }

    strokeRect(x, y, width, height, color, lineWidth)
    {
        const shape = this.shape;

        color = color || color === 0 ? color : this.strokeStyle;
        lineWidth = lineWidth || this.lineWidth;

        shape.clear();
        shape.lineStyle(lineWidth, color);
        this.drawShapeRect(shape, x, y, width, height);
        this.renderCore(shape, undefined, false, false);
    }

    fillRect(x, y, width, height, color)
    {
        const shape = this.shape;

        color = color || color === 0 ? color : this.fillStyle;

        shape.clear();
        shape.beginFill(color);
        this.drawShapeRect(shape, x, y, width, height);
        shape.endFill();
        this.renderCore(shape, undefined, false, false);
        // shape._spriteRect = null;
    }

    drawShapeRect(shape, x, y, width, height)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originX;
        const dy = y - t.originY;

        shape.mask = this.mask;
        shape.drawRect(dx, dy, width, height);
    }

    strokeCircle(x, y, radius, color, lineWidth)
    {
        const shape = this.shape;

        shape.clear();
        shape.lineStyle(lineWidth, color);
        this.drawShapeCircle(shape, x, y, radius);
        this.renderCore(shape, undefined, false, false);
    }

    fillCircle(x, y, radius, color)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color);
        this.drawShapeCircle(shape, x, y, radius);
        shape.endFill();
        this.renderCore(shape, undefined, false, false);
    }

    drawShapeCircle(shape, x, y, radius)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originX;
        const dy = y - t.originY;

        shape.mask = this.mask;
        shape.drawCircle(dx, dy, radius);
    }

    strokeArc(x, y, radius, startAngle, endAngle, anticlockwise, color, lineWidth)
    {
        const shape = this.shape;

        shape.clear();
        shape.lineStyle(lineWidth, color);
        this.drawShapeArc(shape, x, y, radius, startAngle, endAngle, anticlockwise);
        this.renderCore(shape, undefined, false, false);
    }

    fillArc(x, y, radius, startAngle, endAngle, anticlockwise, color)
    {
        const shape = this.shape;

        shape.clear();
        shape.beginFill(color);
        this.drawShapeArc(shape, x, y, radius, startAngle, endAngle, anticlockwise);
        shape.endFill();
        this.renderCore(shape, undefined, false, false);
    }

    drawShapeArc(shape, x, y, radius, startAngle, endAngle, anticlockwise)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originX;
        const dy = y - t.originY;

        shape.mask = this.mask;
        shape.arc(dx, dy, radius, startAngle, endAngle, anticlockwise);
    }

    strokeText(text, x, y, color, lineWidth, style)
    {
        style = style || {};
        style.stroke = color || style.stroke;
        style.strokeThickness = lineWidth || style.strokeThickness;

        this.drawText(text, x, y, style, undefined, false);
    }

    fillText(text, x, y, color, style)
    {
        style = style || {};
        style.fill = color || style.fill;

        this.drawText(text, x, y, style, undefined, false);
    }

    drawText(text, x, y, style, renderTexture, clear)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const dx = x - t.originX;
        const dy = y - t.originY;

        const textSprite = this.textSprite;

        textSprite.transform.position.set(dx, dy);

        textSprite.text = text;
        textSprite.style = style;
        textSprite.mask = this.mask;

        this.renderCore(textSprite, renderTexture, clear, false);

        this.renderer.flush();
    }

    drawDisplayObject(displayObject, dx, dy, dw, dh)
    {
        if (arguments.length === 5)
        {
            displayObject.width = dw;
            displayObject.height = dh;
            this.renderAt(displayObject, dx, dy);
        }
        else
        {
            this.renderAt(displayObject, dx, dy);
        }
    }

    drawDisplayObjectAt(displayObject, dx, dy)
    {
        this.renderAt(displayObject, dx, dy);
    }

    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
    {
        const count = arguments.length;
        let sprite;

        if (count === 9)
        {
            sprite = this.createSprite(image, sx, sy, sw, sh, true);
            sprite.width = dw;
            sprite.height = dh;
            this.renderAt(sprite, dx, dy);
        }
        else if (count === 5)
        {
            sprite = this.createSprite(image, 0, 0, image.width, image.height, true);
            // dx, dy, dw, dh
            sprite.width = sw;
            sprite.height = sh;
            this.renderAt(sprite, sx, sy);
        }
        else
        {
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

    render(displayObject, renderTexture, clear, skipUpdateTransform)
    {
        this.updateGlobalContainer();

        if (this.mask)
        {
            displayObject.mask = this.mask;
        }

        this.renderCore(displayObject, renderTexture, clear, skipUpdateTransform);
    }

    renderAt(displayObject, dx, dy, renderTexture, clear, skipUpdateTransform)
    {
        this.updateGlobalContainer();

        const t = this.globalTransform;
        const x = dx - t.originX;
        const y = dy - t.originY;

        displayObject.transform.position.set(x, y);

        if (this.mask)
        {
            displayObject.mask = this.mask;
        }

        this.renderCore(displayObject, renderTexture, clear, skipUpdateTransform);
    }

    renderPart(displayObject, sx, sy, sw, sh, renderTexture, clear, skipUpdateTransform)
    {
        const frame = displayObject._texture._frame;

        frame.x = sx;
        frame.y = sy;
        frame.width = sw;
        frame.height = sh;
        displayObject._texture._updateUvs();

        this.updateGlobalContainer();

        if (this.mask)
        {
            displayObject.mask = this.mask;
        }

        this.renderCore(displayObject, renderTexture, clear, skipUpdateTransform);
    }

    renderPartAt(displayObject, sx, sy, sw, sh, dx, dy, renderTexture, clear, skipUpdateTransform)
    {
        const frame = displayObject._texture._frame;

        frame.x = sx;
        frame.y = sy;
        frame.width = sw;
        frame.height = sh;
        displayObject._texture._updateUvs();

        this.updateGlobalContainer();

        const t = this.globalTransform;
        const x = dx - t.originX;
        const y = dy - t.originY;

        displayObject.transform.position.set(x, y);

        if (this.mask)
        {
            displayObject.mask = this.mask;
        }

        this.renderCore(displayObject, renderTexture, clear, skipUpdateTransform);
    }

    /**
     *
     *
     *
     *
     *
     *
     **/

    createTexture(image, sx, sy, sw, sh, id)
    {
        const count = arguments.length;
        const baseTexture = BaseTexture.from(image);
        let texture;

        if (count === 2)
        {
            id = sx;
        }
        if (id)
        {
            texture = this.texturePool[id];
            if (texture)
            {
                return texture;
            }
        }

        const rect = sw && sh ? new Rectangle(sx, sy, sw, sh) : null;

        texture = new Texture(baseTexture, rect);
        if (id)
        {
            this.texturePool[id] = texture;
        }

        return texture;
    }

    createSpriteByTexture(texture, container)
    {
        const sprite = Sprite.from(texture);

        if (container !== false)
        {
            if (!container || container === true)
            {
                container = this.globalContainer;
            }
            container.addChild(sprite);
        }

        return sprite;
    }

    createGraphics(container)
    {
        const graphics = new Graphics();

        if (container !== false)
        {
            if (!container || container === true)
            {
                container = this.globalContainer;
            }
            container.addChild(graphics);
        }

        return graphics;
    }

    createSprite(image, sx, sy, sw, sh, container)
    {
        const count = arguments.length;
        let id;
        let texture;

        if (count > 2)
        {
            // id = [image.id || image.src, sx, sy, sw, sh].join('-');
            texture = this.createTexture(image, sx, sy, sw, sh, id);
        }
        else
        {
            container = sx;
            // id = image.id || image.src;
            texture = this.createTexture(image, id);
        }

        const sprite = this.createSpriteByTexture(texture, container);

        return sprite;
    }

    createNineSliceObject(image, sx, sy, sw, sh, L, T, R, B, container)
    {
        const count = arguments.length;
        let id;
        let texture;

        if (count >= 9)
        {
            // id = [image.id || image.src, sx, sy, sw, sh].join('-');
            texture = this.createTexture(image, sx, sy, sw, sh, id);
        }
        else
        {
            // id = image.id || image.src;
            texture = this.createTexture(image, id);
            if (count === 6)
            {
                container = L;
            }
            L = sx;
            T = sy;
            R = sw;
            B = sh;
        }

        const sprite = new mesh.NineSlicePlane(texture, L, T, R, B);

        if (container !== false)
        {
            if (!container || container === true)
            {
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

        if (container !== false)
        {
            if (!container || container === true)
            {
                container = this.globalContainer;
            }
            container.addChild(sprite);
        }

        return sprite;
    }

    createContainer(parentContainer)
    {
        const container = new Container();

        if (parentContainer !== false)
        {
            if (!parentContainer || parentContainer === true)
            {
                parentContainer = this.globalContainer;
            }
            parentContainer.addChild(container);
        }

        return container;
    }

    createParticleContainer(options, parentContainer)
    {
        options = options || {};
        const particleMaxSize = options.particleMaxSize;
        const particleBatchSize = options.particleBatchSize;
        const container = new ParticleContainer(particleMaxSize, options, particleBatchSize);

        if (parentContainer !== false)
        {
            if (!parentContainer || parentContainer === true)
            {
                parentContainer = this.globalContainer;
            }
            parentContainer.addChild(container);
        }

        return container;
    }

    destroy()
    {
        this._lastRenderTexture = null;
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
