import * as core from '../../core';

const DisplayObject = core.DisplayObject;

export default class DisplayPoint extends DisplayObject
{

    /**
     * @param {number} x - the position.x of the point
     * @param {number} y - the position.y of the point
     * @param {number} size - the size of the point
     * @param {array}  color - the rgb color of the point
     * @param {number} alpha - the alpha of the point
     */
    constructor(x, y, size, color, alpha)
    {
        super();

        this.disabled = false;

        this.x = x;
        this.y = y;
        this.size = size || 16;
        this.color = color || [1.0, 1.0, 1.0];
        this.alpha = alpha || 1;

        this.pluginName = 'point';
    }

    updateTransformWithParent()
    {
        // empty
    }

    updateTransform()
    {
        // empty
    }

    /**
    *
    * Renders the object using the WebGL renderer
    *
    * @private
    * @param {PIXI.WebGLRenderer} renderer - The webgl renderer to use.
    */
    renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    }

    destroy()
    {
        super.destroy();
        this.color = null;
    }
}
