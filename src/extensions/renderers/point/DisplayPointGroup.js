import * as core from '../../../core';

const DisplayObject = core.DisplayObject;

export default class DisplayPointGroup extends DisplayObject
{

    /**
     * @param {array}  color - the rgb color of the points in the group
     * @param {boolean}  rounded - Whether the points of the point group is rounded
     * @param {array}  points - the points of the point group
     */
    constructor(color, rounded, points)
    {
        super();

        this.color = color || [1.0, 1.0, 1.0];
        this._roundedInt = 0;
        this.rounded = rounded || false;

        this.points = points || [];

        this.pluginName = 'pointGroup';
    }

    addPoint(point)
    {
        this.points.push(point);
    }

    clear()
    {
        this.points.length = 0;
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

    get rounded()
    {
        return this._rounded;
    }

    set rounded(value)
    {
        this._rounded = value;
        this._roundedInt = value ? 1 : 0;
    }

    destroy()
    {
        super.destroy();
        this.color = null;
        this.points = null;
    }
}
