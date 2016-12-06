import * as core from '../../core';

const Container = core.Container;

/**
 * Updates the transform of this container.
 *
 * @param {boolean} [includeChildren] - Should we update the transforms of children ?
 */
Container.prototype.updateTransformLite = function(includeChildren)
{
    this._boundsID++;

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

    if (includeChildren === true)
    {
        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            const child = this.children[i];

            if (child.visible)
            {
                child.updateTransformLite(true);
            }
        }
    }
};

Container.prototype._removeChildAt = function(index, child)
{
    this.children.splice(index, 1);
    child.parent = null;
    this.onChildrenChange(index);
    child.emit('removed', this);
    return child;
};

Container.prototype.renderWebGLChildren = function(renderer)
{
    let i = 0;
    let len = this.children.length;
    while (i < len) {
        const child = this.children[i];
        if (child._toRemove) {
            len--;
            this._removeChildAt(i, child);
            continue;
        }
        child.renderWebGL(renderer);
        i++;
    }

};

Container.prototype.renderCanvasChildren = function(renderer)
{
    let i = 0;
    let len = this.children.length;
    while (i < len) {
        const child = this.children[i];
        if (child._toRemove) {
            len--;
            this._removeChildAt(i, child);
            continue;
        }
        child.renderCanvas(renderer);
        i++;
    }
};
