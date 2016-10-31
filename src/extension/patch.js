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

core.Sprite.prototype.calculateVerticesWithoutTransform = function(normal) {
    if (this._textureID === this._texture._updateID) {
        return;
    }
    this._textureID = this._texture._updateID;

    const texture = this._texture;
    const vertexData = this.vertexData;
    const trim = texture.trim;
    const orig = texture.orig;
    const anchor = this._anchor;

    const width = orig.width;
    const height = orig.height;

    let w0 = 0;
    let w1 = 0;
    let h0 = 0;
    let h1 = 0;

    if (trim) {
        w1 = trim.x - (anchor._x * width);
        w0 = w1 + trim.width;

        h1 = trim.y - (anchor._y * height);
        h0 = h1 + trim.height;
    } else {
        w0 = width * (1 - anchor._x);
        w1 = width * -anchor._x;

        h0 = height * (1 - anchor._y);
        h1 = height * -anchor._y;
    }

    if (normal) {
        vertexData[0] = w1 / width;
        vertexData[1] = h1 / height;

        vertexData[2] = w0 / width;
        vertexData[3] = h1 / height;

        vertexData[4] = w0 / width;
        vertexData[5] = h0 / height;

        vertexData[6] = w1 / width;
        vertexData[7] = h0 / height;
    } else {
        vertexData[0] = w1;
        vertexData[1] = h1;

        vertexData[2] = w0;
        vertexData[3] = h1;

        vertexData[4] = w0;
        vertexData[5] = h0;

        vertexData[6] = w1;
        vertexData[7] = h0;
    }

    this.origRealWidth = w0 - w1;
    this.origRealHeight = w0 - w1;

};



