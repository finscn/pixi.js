
const Matrix3 = {};

export default Matrix3;

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */

Matrix3.create = function(m00, m01, m02, m10, m11, m12, m20, m21, m22, out) {
    out = out || new Float32Array(9);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

Matrix3.multiply = function (a, b, out) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];
    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b10 = b[3];
    const b11 = b[4];
    const b12 = b[5];
    const b20 = b[6];
    const b21 = b[7];
    const b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};


Matrix3.squareToQuadrilateral = function (x0, y0, x1, y1, x2, y2, x3, y3, out) {

    const sx = x0 - x1 + x2 - x3;
    const sy = y0 - y1 + y2 - y3;
    if (sx === 0.0 && sy === 0.0) {
        out = Matrix3.create(
          x1 - x0, y1 - y0, 0.0,
          x2 - x1, y2 - y1, 0.0,
          x0, y0, 1.0, out);
    } else {
        const dx1 = x1 - x2;
        const dy1 = y1 - y2;
        const dx2 = x3 - x2;
        const dy2 = y3 - y2;
        const denominator = dx1 * dy2 - dx2 * dy1;
        const a13 = (sx * dy2 - dx2 * sy) / denominator;
        const a23 = (dx1 * sy - sx * dy1) / denominator;
        out = Matrix3.create(
          x1 - x0 + a13 * x1,
          y1 - y0 + a13 * y1,
          a13,
          x3 - x0 + a23 * x3,
          y3 - y0 + a23 * y3,
          a23,
          x0, y0, 1.0, out);
    }
    return out;
};

Matrix3.quadrilateralToSquare = function(x0, y0, x1, y1, x2, y2, x3, y3, out) {

    // const sToq = Matrix3.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3);
    // const qToS = new Float32Array(9);
    // Matrix3.adjoint(qToS, sToq);
    // console.log(qToS)
    // return qToS;

    out = Matrix3.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3, out);

    // invert through adjoint
    const a = out[0];
    const d = out[1];
    const g = out[2];
    const b = out[3];
    const e = out[4];
    const h = out[5];
    const c = out[6];
    const f = out[7];

    const A =     e - f * h;
    const B = c * h - b;
    const C = b * f - c * e;
    const D = f * g - d;
    const E =     a - c * g;
    const F = c * d - a * f;
    const G = d * h - e * g;
    const H = b * g - a * h;
    const I = a * e - b * d;

    // Probably unnecessary since 'I' is also scaled by the determinant,
    //   and 'I' scales the homogeneous coordinate, which, in turn,
    //   scales the X,Y coordinates.
    // Determinant  =   a * (e - f * h) + b * (f * g - d) + c * (d * h - e * g);
    const det = a * A + b * D + c * G;

    out[0] = A / det;
    out[1] = D / det;
    out[2] = G / det;
    out[3] = B / det;
    out[4] = E / det;
    out[5] = H / det;
    out[6] = C / det;
    out[7] = F / det;
    out[8] = I / det;

    // console.log(out)
    return out;
};

Matrix3.perspective = function(fromQuad, toQuad, out) {
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
    out = out || new Float32Array(9);
    Matrix3.multiply(qToS, sToQ, out);
    return out;
};

Matrix3.perspectiveTransfromPoint = function(mat, x, y) {
    const a = x * mat[0] + y * mat[1] + mat[2];
    const b = x * mat[3] + y * mat[4] + mat[5];
    const c = x * mat[6] + y * mat[7] + mat[8];
    return [a / c, b / c];
};


Matrix3.adjoint = function(a, out) {
    out = out || new Float32Array(9);

    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

Matrix3.invert = function(a, out) {
    out = out || new Float32Array(9);

    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];
    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    // Calculate the determinant
    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

Matrix3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', '
            + a[3] + ', ' + a[4] + ', ' + a[5] + ', '
            + a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};
