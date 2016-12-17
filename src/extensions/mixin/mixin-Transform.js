import * as core from '../../core';

const Transform = core.Transform;

/**
 * Updates world matrix(include local matrix) without parent
 */
Transform.prototype.updateTransformAsOrphan = function ()
{
    const lt = this.localTransform;

    lt.a = this._cx * this.scale.x;
    lt.b = this._sx * this.scale.x;
    lt.c = this._cy * this.scale.y;
    lt.d = this._sy * this.scale.y;

    lt.tx = this.position.x - ((this.pivot.x * lt.a) + (this.pivot.y * lt.c));
    lt.ty = this.position.y - ((this.pivot.x * lt.b) + (this.pivot.y * lt.d));

    const wt = this.worldTransform;

    wt.a = lt.a;
    wt.b = lt.b;
    wt.c = lt.c;
    wt.d = lt.d;
    wt.tx = lt.tx;
    wt.ty = lt.ty;

    this._worldID ++;
};
