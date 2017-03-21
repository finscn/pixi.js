import * as mesh from '../../mesh';

const Mesh = mesh.Mesh;

Mesh.prototype.meshUpdateTransformWithParent = Mesh.prototype.updateTransformWithParent;

Mesh.prototype.updateTransformWithParent = function ()
{
    this.refresh();
    this.meshUpdateTransformWithParent();
};
