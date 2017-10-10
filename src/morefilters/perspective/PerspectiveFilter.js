import * as core from '../../core';
import mat3 from '../../extensions/Matrix3';
import vertex from './perspective.vert.js';
import fragment from './perspective.frag.js';

const Matrix3 = mat3;

export default class PerspectiveFilter extends core.Filter
{

    constructor(fromQuad, toQuad)
    {
        super(
            vertex,
            fragment
        );

        this.perspectiveMatrix = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]);

        this.updateMatrix(fromQuad, toQuad);
    }

    updateMatrix(fromQuad, toQuad)
    {
        if (fromQuad && toQuad)
        {
            const qToS = Matrix3.quadrilateralToSquare(
                fromQuad[0], fromQuad[1],
                fromQuad[2], fromQuad[3],
                fromQuad[4], fromQuad[5],
                fromQuad[6], fromQuad[7]
            );
            const sToQ = Matrix3.squareToQuadrilateral(
                toQuad[0], toQuad[1],
                toQuad[2], toQuad[3],
                toQuad[4], toQuad[5],
                toQuad[6], toQuad[7]
            );

            Matrix3.multiply(qToS, sToQ, this.perspectiveMatrix);
        }
        else if (fromQuad)
        {
            toQuad = fromQuad;
            Matrix3.squareToQuadrilateral(
                toQuad[0], toQuad[1],
                toQuad[2], toQuad[3],
                toQuad[4], toQuad[5],
                toQuad[6], toQuad[7],
                this.perspectiveMatrix
            );
        }
    }

    apply(filterManager, input, output, clear, currentState)
    {
        const currentSprite = currentState.target;

        this.uniforms.perspectiveMatrix = this.perspectiveMatrix;
        this.uniforms.worldMatrix = currentSprite.worldTransform.toArray(9);
        this.uniforms.worldMatrixT = Matrix3.invert(this.uniforms.worldMatrix, new Float32Array(9));
        this.uniforms.spriteWidth = currentSprite.width;
        this.uniforms.spriteHeight = currentSprite.height;
        this.uniforms.spriteScaleX = currentSprite.scale.x;
        this.uniforms.spriteScaleY = currentSprite.scale.y;
        filterManager.applyFilter(this, input, output, clear);
    }

}

