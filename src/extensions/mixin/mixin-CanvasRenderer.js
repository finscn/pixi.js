import * as core from '../../core';

const CanvasRenderer = core.CanvasRenderer;

/**
 * Renders the displayObject to its webGL view
 *
 * @param {PIXI.DisplayObject} displayObject - the object to be rendered
 * @param {PIXI.RenderTexture} renderTexture - The render texture to render to.
 * @param {boolean} [skipUpdateTransform] - Should we skip the update transform pass?
 */
CanvasRenderer.prototype.renderLite = function(displayObject, renderTexture, skipUpdateTransform)
{
    if (!this.view)
    {
        return;
    }

    if (!skipUpdateTransform)
    {
        displayObject.updateTransformLite();
    }

    this.renderLite(displayObject, renderTexture, false, null, true);
};

