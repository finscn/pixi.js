import * as core from '../core';

const Shader = core.Shader;
const Quad = core.Quad;

export default class BaseSpriteShaderRenderer extends core.ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);
        this.gl = renderer.gl;
        this.textureLocation = 0;
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

        this.bindShader(shader, sprite);

        renderer.bindTexture(texture, this.textureLocation);
        renderer.state.setBlendMode(sprite.blendMode);

        // gl.drawElements(gl.TRIANGLES, 1 * 6, gl.UNSIGNED_SHORT, 0 * 6 * 2);
        this.quad.draw();
    }

    bindShader(shader, sprite)
    {
        this.renderer.bindShader(this.shader);
        shader.uniforms.uAlpha = sprite.worldAlpha;
    }

    getVertexSrc()
    {
        return [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat3 projectionMatrix;',
            'uniform float uAlpha;',
            'varying vec2 vTextureCoord;',
            'varying float vAlpha;',

            'void main(void) {',
            '    vTextureCoord = aTextureCoord;',
            '    vAlpha = uAlpha;',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '}',
        ].join('\n');
    }

    getFragmentSrc()
    {
        return [
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            'varying float vAlpha;',

            'void main(void) {',
            '    vec4 color = texture2D(uSampler, vTextureCoord) * vAlpha;',
            '    if (color.a == 0.0) discard;',
            '    gl_FragColor = color;',
            '}',
        ].join('\n');
    }
}
