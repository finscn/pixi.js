import * as core from '../../core';

const DisplayObject = core.DisplayObject;

/**
 * Updates the transform of this object self
 */
DisplayObject.prototype.updateTransformWithParent = function ()
{
    if (this.parent)
    {
        this.transform.updateTransform(this.parent.transform);
        // TODO: check render flags, how to process stuff here
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    }
    else
    {
        this.transform.updateTransformAsOrphan();
        this.worldAlpha = this.alpha;
    }

    this._bounds.updateID++;
};

/**
 * Remove self from parent
 */
DisplayObject.prototype.remove = function ()
{
    this._toRemove = true;
    if (this.parent)
    {
        this.parent.removeChild(this);
    }
};
