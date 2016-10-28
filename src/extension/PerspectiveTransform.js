import Matrix3 from './Matrix3';

export default class PerspectiveTransform
{

    getMatrix(fromQuad, toQuad)
    {

        // var qToS = getSquareToQuad.apply(null, fromQuad);
        // var sToQ = getSquareToQuad.apply(null, toQuad);
        // var pt = multiply(getInverse(sToQ), qToS);

        // computeQuadToSquare(src);
        // computeSquareToQuad(dst);
        // srcMat * dstMat

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
        const pt = new Float32Array(9);
        Matrix3.multiply(pt, qToS, sToQ);
        // Matrix3.multiply(pt, sToQ, qToS);

        // return new Float32Array([
        //     pt[0], pt[1], 0, pt[2],
        //     pt[3], pt[4], 0, pt[5],
        //     0, 0, 1, 0,
        //     pt[6], pt[7], 0, pt[8],
        // ]);

        return pt;
    }

    transfromPoint(x, y, mat)
    {
        const a = x * mat[0] + y * mat[1] + mat[2];
        const b = x * mat[3] + y * mat[4] + mat[5];
        const c = x * mat[6] + y * mat[7] + mat[8];
        return [a / c, b / c];
    }

}

