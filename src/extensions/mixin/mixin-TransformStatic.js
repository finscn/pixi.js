import * as core from '../../core';

const TransformStatic = core.TransformStatic;

/**
 * Updates world matrix(include local matrix) without parent
 */
TransformStatic.prototype.updateTransformAsOrphan = function ()
{
    const lt = this.localTransform;

    if (this._localID !== this._currentLocalID)
    {
        // get the matrix values of the displayobject based on its transform properties..
        lt.a = this._cx * this.scale._x;
        lt.b = this._sx * this.scale._x;
        lt.c = this._cy * this.scale._y;
        lt.d = this._sy * this.scale._y;

        lt.tx = this.position._x - ((this.pivot._x * lt.a) + (this.pivot._y * lt.c));
        lt.ty = this.position._y - ((this.pivot._x * lt.b) + (this.pivot._y * lt.d));

        this._currentLocalID = this._localID;
    }

    const wt = this.worldTransform;

    wt.a = lt.a;
    wt.b = lt.b;
    wt.c = lt.c;
    wt.d = lt.d;
    wt.tx = lt.tx;
    wt.ty = lt.ty;

    this._worldID ++;
};
