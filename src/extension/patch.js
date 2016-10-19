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
