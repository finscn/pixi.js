import * as core from '../core';
import BaseSpriteShaderRenderer from './BaseSpriteShaderRenderer';
import mat3 from './Matrix3';

const Matrix3 = mat3;

const WebGLRenderer = core.WebGLRenderer;

export default class PerspectiveRenderer extends BaseSpriteShaderRenderer
{

    constructor(renderer)
    {
        super(renderer);
        this.useUvs = true;
        this.uniforms = {};
        this.defaultMatrix = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]);
    }

    updateShaderParameters(shader, sprite)
    {
        shader.uniforms.worldMatrix = sprite.worldTransform.toArray(9);
        shader.uniforms.origWidth = sprite.origRealWidth;
        shader.uniforms.origHeight = sprite.origRealHeight;
        shader.uniforms.anchorX = sprite._anchor._x;
        shader.uniforms.anchorY = sprite._anchor._y;
        // shader.uniforms.quadToSquareMatrix = sprite.quadToSquareMatrix || this.defaultMatrix;
        // shader.uniforms.squareToQuadMatrix = sprite.squareToQuadMatrix || this.defaultMatrix;
        shader.uniforms.perspectiveMatrix = sprite.perspectiveMatrix || this.defaultMatrix;
    }

    getVertexSrc()
    {
        return [
            this.getVertexHeadSrc(),

            // 'uniform mat3 quadToSquareMatrix;',
            // 'uniform mat3 squareToQuadMatrix;',
            'uniform mat3 perspectiveMatrix;',
            'uniform mat3 worldMatrix;',

            'uniform float origWidth;',
            'uniform float origHeight;',
            'uniform float anchorX;',
            'uniform float anchorY;',

            'void main(void) {',
            // '    vColor = vec4(uColor.rgb * uColor.a, uColor.a);',
            '    vAlpha = uAlpha;',

            '    mat3 proM3 = projectionMatrix;',
            '    mat3 worldM3 = worldMatrix;',
            // '    mat3 perM3 = quadToSquareMatrix * squareToQuadMatrix;',
            '    mat3 perM3 = perspectiveMatrix;',

            '    mat4 proM4;',
            '    proM4[0]=vec4( proM3[0][0],  proM3[0][1],  0,  proM3[0][2] );',
            '    proM4[1]=vec4( proM3[1][0],  proM3[1][1],  0,  proM3[1][2] );',
            '    proM4[2]=vec4( 0,            0,            1,  0           );',
            '    proM4[3]=vec4( proM3[2][0],  proM3[2][1],  0,  proM3[2][2] );',

            '    mat4 perM4;',
            '    perM4[0]=vec4( perM3[0][0],  perM3[0][1],  0,  perM3[0][2] );',
            '    perM4[1]=vec4( perM3[1][0],  perM3[1][1],  0,  perM3[1][2] );',
            '    perM4[2]=vec4( 0,            0,            1,  0           );',
            '    perM4[3]=vec4( perM3[2][0],  perM3[2][1],  0,  perM3[2][2] );',

            '    mat4 worldM4;',
            '    worldM4[0]=vec4( worldM3[0][0],  worldM3[0][1],  0,  worldM3[0][2] );',
            '    worldM4[1]=vec4( worldM3[1][0],  worldM3[1][1],  0,  worldM3[1][2] );',
            '    worldM4[2]=vec4( 0,              0,              1,  0             );',
            '    worldM4[3]=vec4( worldM3[2][0],  worldM3[2][1],  0,  worldM3[2][2] );',

            '    float w = origWidth;',
            '    float h = origHeight;',

            '    mat4 scaleM4;',
            '    scaleM4[0] = vec4(w,  0,  0,  0 );',
            '    scaleM4[1] = vec4(0,  h,  0,  0 );',
            '    scaleM4[2] = vec4(0,  0,  1,  0 );',
            '    scaleM4[3] = vec4(-w * anchorX,  -h * anchorY,  0,  1 );',

            '    gl_Position = proM4 * worldM4 * scaleM4 * perM4 * vec4(aVertexPosition.xy, 0.0, 1.0);',
            '    vTextureCoord = aTextureCoord;',
            '}',
        ].join('\n');
    }

    static applyTo(sprite)
    {
        sprite._renderWebGLBakPerspectiveRenderer = sprite._renderWebGL;
        sprite._renderWebGL = PerspectiveRenderer.__renderWebGLSprite;

        sprite._calculateBoundsBakPerspectiveRenderer = sprite._calculateBounds;
        sprite._calculateBounds = PerspectiveRenderer.__calculateBoundsSprite;

        sprite.updatePerspective = PerspectiveRenderer._updatePerspectiveSprite;
        sprite.calculatePerspectiveVertices = PerspectiveRenderer._calculatePerspectiveVerticesSprite;
        sprite.perspectivePoint = PerspectiveRenderer._perspectivePointSprite;

        sprite.perspectiveMatrix = new Float32Array(9);
        sprite._lastPerspectiveMatrixId = -1;
        sprite._perspectiveMatrixId = 1;
    }

    static unapplyTo(sprite)
    {
        if (sprite._perspectiveRendererBakRenderWebGL) {
            sprite._renderWebGL = sprite._renderWebGLBakPerspectiveRenderer;
            sprite._renderWebGLBakPerspectiveRenderer = null;
            sprite._calculateBounds = sprite._perspectivePcalculateBoundsWebGL;
            sprite._perspectivePcalculateBoundsWebGL = null;

            sprite.updatePerspective = null;
            sprite.calculatePerspectiveVertices = null;
            sprite.perspectivePoint = null;

            sprite.perspectiveMatrix = null;
            sprite._lastPerspectiveMatrixId = null;
            sprite._perspectiveMatrixId = null;
        }
    }

    // sprite.updatePerspective(toQuad);
    // sprite.updatePerspective(fromQuad, toQuad);
    static _updatePerspectiveSprite(fromQuad, toQuad)
    {
        const sprite = this;

        if (fromQuad && toQuad) {
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

            // sprite.quadToSquareMatrix = qToS;
            // sprite.squareToQuadMatrix = sToQ;
            Matrix3.multiply(qToS, sToQ, sprite.perspectiveMatrix);

        } else if (fromQuad) {
            // if (!sprite._texture) {
            //     return false;
            // }
            // toQuad = fromQuad;
            // const frame = sprite._texture._frame;
            // const x = 0; // frame.x;
            // const y = 0; // frame.y;
            // const w = frame.width;
            // const h = frame.height;
            // fromQuad = [
            //     x, y,
            //     x + w, y,
            //     x + w, y + h,
            //     x, y,
            // ];
            toQuad = fromQuad;
            Matrix3.squareToQuadrilateral(
                toQuad[0], toQuad[1],
                toQuad[2], toQuad[3],
                toQuad[4], toQuad[5],
                toQuad[6], toQuad[7],
                sprite.perspectiveMatrix
            );
        }

        sprite._perspectiveMatrixId++;

        return true;
    }

    static __renderWebGLSprite(renderer)
    {
        const sprite = this;
        // sprite.calculateVerticesWithoutTransform(true);
        sprite.calculateVertices();
        renderer.setObjectRenderer(renderer.plugins.perspective);
        renderer.plugins.perspective.render(sprite);
    }


    static __calculateBoundsSprite()
    {
        const sprite = this;

        const trim = sprite._texture.trim;
        const orig = sprite._texture.orig;

        if (sprite.perspectiveMatrix) {
            const changed = sprite.calculatePerspectiveVertices();
            if (changed !== false) {
                sprite._bounds.addQuad(sprite.vertexPerspective);
            }
            return;
        }
        // First lets check to see if the current texture has a trim..
        if (!trim || trim.width === orig.width && trim.height === orig.height) {
            // no trim! lets use the usual calculations..
            sprite.calculateVertices();
            sprite._bounds.addQuad(sprite.vertexData);
        } else {
            // lets calculate a special trimmed bounds...
            sprite.calculateTrimmedVertices();
            sprite._bounds.addQuad(sprite.vertexTrimmedData);
        }
    }

    static _calculatePerspectiveVerticesSprite()
    {
        const sprite = this;

        if (sprite._perspectiveMatrixId === sprite._lastPerspectiveMatrixId
            && sprite._transformID === sprite.transform._worldID
            && sprite._textureID === sprite._texture._updateID)
        {
            return false;
        }
        sprite._lastPerspectiveMatrixId = sprite._perspectiveMatrixId;
        const pM = sprite.perspectiveMatrix;
        const vertexData = sprite.vertexPerspective = sprite.vertexPerspective || new Float32Array(8);

        const wt = sprite.transform.worldTransform;
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const anchor = sprite._anchor;
        const texture = sprite._texture;
        const orig = texture.orig;
        // const trim = texture.trim;

        const w0 = (orig.width) * (1 - anchor._x);
        const w1 = (orig.width) * -anchor._x;

        const h0 = orig.height * (1 - anchor._y);
        const h1 = orig.height * -anchor._y;

        const rw = w0 - w1;
        const rh = h0 - h1;

        const p0 = sprite.perspectivePoint(pM, 0, 0, rw, rh, w1, h1);
        const p1 = sprite.perspectivePoint(pM, 1, 0, rw, rh, w1, h1);
        const p2 = sprite.perspectivePoint(pM, 1, 1, rw, rh, w1, h1);
        const p3 = sprite.perspectivePoint(pM, 0, 1, rw, rh, w1, h1);

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

        return true;
    }

    static _perspectivePointSprite(mat, x, y, width, height, ox, oy)
    {
        const a = x * mat[0] + y * mat[3] + mat[6];
        const b = x * mat[1] + y * mat[4] + mat[7];
        const c = x * mat[2] + y * mat[5] + mat[8];
        return [width * a / c + ox, height * b / c + oy];
    }
}

WebGLRenderer.registerPlugin('perspective', PerspectiveRenderer);
