import * as core from '../../core';

const Matrix = core.math.Matrix;

Matrix.prototype.toArray16 = function (transpose, array)
{
    if (!array)
    {
        array = new Float32Array(16);
    }

    if (transpose)
    {
        array[0] = this.a;
        array[1] = this.b;
        array[2] = 0;
        array[3] = 0;

        array[4] = this.c;
        array[5] = this.d;
        array[6] = 0;
        array[7] = 0;

        array[8] = 0;
        array[9] = 0;
        array[10] = 1;
        array[11] = 0;

        array[12] = this.tx;
        array[13] = this.ty;
        array[14] = 0;
        array[15] = 1;
    }
    else
    {
        array[0] = this.a;
        array[1] = this.c;
        array[2] = 0;
        array[3] = this.tx;

        array[4] = this.b;
        array[5] = this.d;
        array[6] = 0;
        array[7] = this.ty;

        array[8] = 0;
        array[9] = 0;
        array[10] = 1;
        array[11] = 0;

        array[12] = 0;
        array[13] = 0;
        array[14] = 0;
        array[15] = 1;
    }

    return array;
};
