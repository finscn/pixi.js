import * as core from '../../core';

const Transform = core.Transform;

/**
 * Updates world matrix(include local matrix) without parent
 */
Transform.prototype.updateTransformAsOrphan = function()
{
    const lt = this.localTransform;

    lt.a = this._cx * this.scale._x;
    lt.b = this._sx * this.scale._x;
    lt.c = this._cy * this.scale._y;
    lt.d = this._sy * this.scale._y;

    lt.tx = this.position._x - ((this.pivot._x * lt.a) + (this.pivot._y * lt.c));
    lt.ty = this.position._y - ((this.pivot._x * lt.b) + (this.pivot._y * lt.d));

    const wt = this.worldTransform;

    wt.a = lt.a;
    wt.b = lt.b;
    wt.c = lt.c;
    wt.d = lt.d;
    wt.tx = lt.tx;
    wt.ty = lt.ty;

    this._worldID ++;
};
