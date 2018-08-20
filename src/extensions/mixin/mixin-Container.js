import * as core from '../../core';

const Container = core.Container;

/**
 * Sort children by zIndex or compare-function.
 * @param {function} [compareFunction] - The compare function for sorting.
 * if no compareFunction, sort children by child.zIndex.
 */
Container.prototype.sortChildren = function (compareFunction)
{
    const children = this.children;
    const count = children.length;

    if (count > 0)
    {
        if (compareFunction && typeof compareFunction === 'function')
        {
            this.children.sort(compareFunction);
        }
        else
        {
            let childA;
            let childB;

            for (let i = 1; i < count; i++)
            {
                childA = children[i];
                const zIndex = childA.zIndex || 0;

                let j = i;

                for (; j > 0 && ((childB = children[j - 1]).zIndex || 0) > zIndex; j--)
                {
                    children[j] = childB;
                }
                children[j] = childA;
            }
        }
        this.onChildrenChange(0);
    }
};

/**
 * A fast way to removes all children directly.
 *
 * @param {object|boolean} [options] - Options parameter.
 *     If the child is a sprite, see `options` of Sprite's destroy method.
 *        @see PIXI.Sprite#destroy
 *     If the child is a container, see `options` of Container's destroy method.
 *        @see PIXI.Container#destroy
 */
Container.prototype.removeAllChildren = function (options)
{
    if (options)
    {
        const oldChildren = this.children;

        for (let i = 0; i < oldChildren.length; ++i)
        {
            oldChildren[i].destroy(options);
        }
    }

    this.children.length = 0;

    this.transform._parentID = -1;

    this._boundsID++;

    this.onChildrenChange(0);
};

/**
 * Updates the transform of this container.
 *
 * @param {boolean} [includeChildren=true] - Should we update the transforms of children ?
 */
Container.prototype.updateTransformWithParent = function (includeChildren)
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

    if (includeChildren !== false)
    {
        for (let i = 0, j = this.children.length; i < j; ++i)
        {
            const child = this.children[i];

            if (child.visible)
            {
                child.updateTransformWithParent();
            }
        }
    }
};

Container.prototype._removeChildAt = function (index, child)
{
    this.children.splice(index, 1);
    child.parent = null;
    // child.transform._parentID = -1;
    this._boundsID++;
    this.onChildrenChange(index);
    child.emit('removed', this);

    return child;
};

Container.prototype.renderChildrenWebGL = function (renderer)
{
    let i = 0;
    let len = this.children.length;

    while (i < len)
    {
        const child = this.children[i];

        if (child._toRemove)
        {
            len--;
            this._removeChildAt(i, child);
            continue;
        }
        child.renderWebGL(renderer);
        i++;
    }
};

Container.prototype.renderChildrenCanvas = function (renderer)
{
    let i = 0;
    let len = this.children.length;

    while (i < len)
    {
        const child = this.children[i];

        if (child._toRemove)
        {
            len--;
            this._removeChildAt(i, child);
            continue;
        }
        child.renderCanvas(renderer);
        i++;
    }
};
