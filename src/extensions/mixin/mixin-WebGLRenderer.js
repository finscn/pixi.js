import * as core from '../../core';

const WebGLRenderer = core.WebGLRenderer;

/**
 * Renders the displayObject to its webGL view
 *
 * @param {PIXI.DisplayObject} displayObject - the object to be rendered
 * @param {PIXI.RenderTexture} renderTexture - The render texture to render to.
 * @param {boolean} [skipUpdateTransform] - Should we skip the update transform pass?
 */
WebGLRenderer.prototype.renderBasic = function(displayObject, renderTexture, skipUpdateTransform)
{
    // can be handy to know!
    this.renderingToScreen = !renderTexture;

    this.emit('prerender');

    // no point rendering if our context has been blown up!
    if (!this.gl || this.gl.isContextLost())
    {
        return;
    }

    this._nextTextureLocation = 0;

    if (!renderTexture)
    {
        this._lastObjectRendered = displayObject;
    }

    if (!skipUpdateTransform)
    {
        displayObject.updateTransformWithParent(true);
    }

    this.bindRenderTexture(renderTexture);

    this.currentRenderer.start();

    displayObject.renderWebGL(this);

    // apply transform..
    this.currentRenderer.flush();

    // this.setObjectRenderer(this.emptyRenderer);

    this.textureGC.update();

    this.emit('postrender');
};
