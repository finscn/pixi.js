import * as core from '../core';
import Matrix3 from './Matrix3';

const Shader = core.Shader;
const Quad = core.Quad;
const WebGLRenderer = core.WebGLRenderer;

export default class PerspectiveRenderer extends core.ObjectRenderer
{

    constructor(renderer)
    {
        super(renderer);
        this.gl = renderer.gl;
        this.uniforms = {};
        this.defaultMatrix = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]);
    }

    onContextChange()
    {
        const gl = this.renderer.gl;
        const shader = this.shader = this.generateShader(gl);
        const quad = this.quad = new Quad(gl, this.renderer.state.attribState);
        quad.initVao(shader);
    }

    generateShader(gl, args)
    {
        if (args) {
            // noop
        }
        const vertexSrc = this.getVertexSrc();
        const fragmentSrc = this.getFragmentSrc();
        const shader = new Shader(gl, vertexSrc, fragmentSrc);
        return shader;
    }

    start()
    {
        this.renderer.bindShader(this.shader);
    }

    render(sprite)
    {
        if (!sprite.texture._uvs) {
            return;
        }

        const renderer = this.renderer;
        const shader = this.shader;
        const quad = this.quad;

        const texture = sprite._texture.baseTexture;
        const vertexData = sprite.computedGeometry ? sprite.computedGeometry.vertices : sprite.vertexData;

        // const tint = sprite._tintRGB + (sprite.worldAlpha * 255 << 24);
        const uvs = sprite._texture._uvs;

        const vertices = quad.vertices;
        for (let i = 0; i < 8; i++) {
            vertices[i] = vertexData[i];
        }
        quad.uvs[0] = uvs.x0;
        quad.uvs[1] = uvs.y0;
        quad.uvs[2] = uvs.x1;
        quad.uvs[3] = uvs.y1;
        quad.uvs[4] = uvs.x2;
        quad.uvs[5] = uvs.y2;
        quad.uvs[6] = uvs.x3;
        quad.uvs[7] = uvs.y3;

        quad.upload();

        shader.uniforms.uAlpha = sprite.worldAlpha;
        shader.uniforms.worldMatrix = sprite.worldTransform.toArray(9);
        shader.uniforms.worldMatrixT = Matrix3.invert(new Float32Array(9), shader.uniforms.worldMatrix);
        shader.uniforms.spriteWidth = sprite.width;
        shader.uniforms.spriteHeight = sprite.height;
        shader.uniforms.spriteScaleX = sprite.scale.x;
        shader.uniforms.spriteScaleY = sprite.scale.y;
        shader.uniforms.quadToSquareMatrix = sprite.quadToSquareMatrix || this.defaultMatrix;
        shader.uniforms.squareToQuadMatrix = sprite.squareToQuadMatrix || this.defaultMatrix;

        renderer.bindTexture(texture, 0);
        renderer.state.setBlendMode(sprite.blendMode);

        // gl.drawElements(gl.TRIANGLES, 1 * 6, gl.UNSIGNED_SHORT, 0 * 6 * 2);
        this.quad.draw();
    }

    getVertexSrc()
    {
        return [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            // 'uniform vec4 aColor;',
            'uniform mat3 projectionMatrix;',
            'uniform float uAlpha;',
            'varying vec2 vTextureCoord;',
            'varying float vAlpha;',

            'uniform mat3 quadToSquareMatrix;',
            'uniform mat3 squareToQuadMatrix;',
            'uniform mat3 worldMatrix;',
            'uniform mat3 worldMatrixT;',

            'uniform float spriteScaleX;',
            'uniform float spriteScaleY;',
            'uniform float spriteWidth;',
            'uniform float spriteHeight;',

            'void main(void) {',
            '    vTextureCoord = aTextureCoord;',
            '    vAlpha = uAlpha;',
            // '    vColor = vec4(aColor.rgb * aColor.a, aColor.a);',
            // '    gl_Position = perspectiveMatrix * vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',

            '    mat3 proM3 = projectionMatrix;',
            '    mat3 worldM3 = worldMatrix;',
            '    mat3 worldM3T = worldMatrixT;',
            '    mat3 perM3 = quadToSquareMatrix * squareToQuadMatrix;',

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

            '    float w = spriteWidth / spriteScaleX;',
            '    float h = spriteHeight / spriteScaleY;',
            '    float iW = 1.0 / w;',
            '    float iH = 1.0 / h;',

            '    mat3 smallM3;',
            '    smallM3[0]=vec3(iW,  0,  0 );',
            '    smallM3[1]=vec3(0,   iH, 0 );',
            '    smallM3[2]=vec3(0,   0,  1 );',

            '    vec3 normalPos = smallM3 * worldM3T * vec3(aVertexPosition, 1.0);',

            '    mat4 bigM4;',
            '    bigM4[0]=vec4(w,  0,  0,  0 );',
            '    bigM4[1]=vec4(0,  h,  0,  0 );',
            '    bigM4[2]=vec4(0,  0,  1,  0 );',
            '    bigM4[3]=vec4(0,  0,  0,  1 );',

            '    gl_Position = proM4 * worldM4 * bigM4 * perM4 *  vec4(normalPos.xy, 0.0, 1.0);',

            '}',
        ].join('\n');
    }

    getFragmentSrc()
    {
        return [
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            // 'varying vec4 vColor;',
            'varying float vAlpha;',

            'void main(void) {',
            '    vec4 color = texture2D(uSampler, vTextureCoord) * vAlpha;',
            '    if (color.a == 0.0) discard;',
            '    gl_FragColor = color;',
            // '    gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;',
            '}',
        ].join('\n');
    }

    static updateMatrix(sprite, toQuad, fromQuad)
    {
        if (!fromQuad) {
            if (!sprite._texture) {
                return false;
            }
            const frame = sprite._texture._frame;
            const x = frame.x;
            const y = frame.y;
            const w = frame.width;
            const h = frame.height;
            fromQuad = [
                x, y,
                x + w, y,
                x + w, y + h,
                x, y,
            ];
        }

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

        sprite.quadToSquareMatrix = qToS;
        sprite.squareToQuadMatrix = sToQ;

        return true;
    }

    static applyTo(sprite)
    {
        sprite._perspectiveRendererBakRenderWebGL = sprite._renderWebGL;
        sprite._renderWebGL = PerspectiveRenderer._spriteRenderWebGL;
    }

    static unapplyTo(sprite)
    {
        if (sprite._perspectiveRendererBakRenderWebGL) {
            sprite._renderWebGL = sprite._perspectiveRendererBakRenderWebGL;
        }
    }

    static _spriteRenderWebGL(renderer)
    {
        this.calculateVertices();

        renderer.setObjectRenderer(renderer.plugins.perspective);
        renderer.plugins.perspective.render(this);
    }
}

WebGLRenderer.registerPlugin('perspective', PerspectiveRenderer);
