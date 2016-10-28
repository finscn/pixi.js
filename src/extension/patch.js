import * as core from '../core';

core.utils.log = function( /* arge */ ) {
    window.console.log.apply(window.console, arguments);
};

///////////////////////////

core.Container.prototype._removeChildAt = function(index, child) {
    this.children.splice(index, 1);
    child.parent = null;
    this.onChildrenChange(index);
    child.emit('removed', this);
    return child;
};

core.Container.prototype.renderWebGLChildren = function(renderer) {
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

core.Container.prototype.renderCanvasChildren = function(renderer) {
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

core.Sprite.prototype.calculateVertices = function() {
    if (this._transformID === this.transform._worldID && this._textureID === this._texture._updateID)
    {
        return;
    }

    this._transformID = this.transform._worldID;
    this._textureID = this._texture._updateID;

    // set the vertex data

    const texture = this._texture;
    const wt = this.transform.worldTransform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const vertexData = this.vertexData;
    const trim = texture.trim;
    const orig = texture.orig;
    const anchor = this._anchor;

    let w0 = 0;
    let w1 = 0;
    let h0 = 0;
    let h1 = 0;

    if (trim)
    {
        // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
        // space before transforming the sprite coords.
        w1 = trim.x - (anchor._x * orig.width);
        w0 = w1 + trim.width;

        h1 = trim.y - (anchor._y * orig.height);
        h0 = h1 + trim.height;
    }
    else
    {
        w0 = orig.width * (1 - anchor._x);
        w1 = orig.width * -anchor._x;

        h0 = orig.height * (1 - anchor._y);
        h1 = orig.height * -anchor._y;
    }

    if (this.perspectiveMatrix) {
        const pM = this.perspectiveMatrix;
        const rw = w0 - w1;
        const rh = h0 - h1;

        const p0 = this.perspectivePoint(pM, 0, 0, rw, rh);
        const p1 = this.perspectivePoint(pM, 1, 0, rw, rh);
        const p2 = this.perspectivePoint(pM, 1, 1, rw, rh);
        const p3 = this.perspectivePoint(pM, 0, 1, rw, rh);
        // xy
        vertexData[0] = a * p0[0] + c * p0[1] + tx;
        vertexData[1] = d * p0[1] + b * p0[0] + ty;

        // xy
        vertexData[2] = a * p1[0] + c * p1[1] + tx;
        vertexData[3] = d * p1[1] + b * p1[0] + ty;

        // xy
        vertexData[4] = a * p2[0] + c * p2[1] + tx;
        vertexData[5] = d * p2[1] + b * p2[0] + ty;

        // xy
        vertexData[6] = a * p3[0] + c * p3[1] + tx;
        vertexData[7] = d * p3[1] + b * p3[0] + ty;
    } else {
        // xy
        vertexData[0] = a * w1 + c * h1 + tx;
        vertexData[1] = d * h1 + b * w1 + ty;

        // xy
        vertexData[2] = a * w0 + c * h1 + tx;
        vertexData[3] = d * h1 + b * w0 + ty;

        // xy
        vertexData[4] = a * w0 + c * h0 + tx;
        vertexData[5] = d * h0 + b * w0 + ty;

        // xy
        vertexData[6] = a * w1 + c * h0 + tx;
        vertexData[7] = d * h0 + b * w1 + ty;
    }
};

core.Sprite.prototype.perspectivePoint = function(mat, x, y, rw, rh) {
    const a = x * mat[0] + y * mat[3] + mat[6];
    const b = x * mat[1] + y * mat[4] + mat[7];
    const c = x * mat[2] + y * mat[5] + mat[8];
    return [rw * a / c, rh * b / c];
};

