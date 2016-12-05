import * as core from '../../core';

const DisplayObject = core.DisplayObject;

/**
 * Updates the transform of this object self
 */
DisplayObject.prototype.updateTransformLite = function()
{
    if (this.parent)
    {
        this.transform.updateTransform(this.parent.transform);
        // TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    }
    else
    {
        this.transform.updateWorldTransform();
        this.worldAlpha = this.alpha;
    }

    this._bounds.updateID++;
};
