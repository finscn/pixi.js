import * as core from '../core';

const Shader = core.Shader;
const Quad = core.Quad;

// const tempArray = new Float32Array(4);

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

        const vertices = quad.vertices;
        for (let i = 0; i < 8; i++) {
            vertices[i] = vertexData[i];
        }

        const uvs = sprite._texture._uvs;
        quad.uvs[0] = uvs.x0;
        quad.uvs[1] = uvs.y0;
        quad.uvs[2] = uvs.x1;
        quad.uvs[3] = uvs.y1;
        quad.uvs[4] = uvs.x2;
        quad.uvs[5] = uvs.y2;
        quad.uvs[6] = uvs.x3;
        quad.uvs[7] = uvs.y3;

        quad.upload();

        this.renderer.bindShader(this.shader);

        // const tint = sprite._tintRGB + (sprite.worldAlpha * 255 << 24);

        // const color = tempArray;
        // core.utils.hex2rgb(sprite._tint, color);
        // color[3] = sprite.worldAlpha;
        // shader.uniforms.uColor = color;
        shader.uniforms.uAlpha = sprite.worldAlpha;

        this.updateShaderParameters(shader, sprite);


        renderer.bindTexture(texture, this.textureLocation);
        renderer.state.setBlendMode(sprite.blendMode);

        // gl.drawElements(gl.TRIANGLES, 1 * 6, gl.UNSIGNED_SHORT, 0 * 6 * 2);
        this.quad.draw();
    }

    updateShaderParameters(shader, sprite)
    {
        // implemented by subclass
        if (!sprite) {
            return;
        }
    }

    getVertexHeadSrc()
    {
        return [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat3 projectionMatrix;',
            // 'uniform vec4 uColor;',
            'uniform float uAlpha;',
            'varying vec2 vTextureCoord;',
            // 'varying vec4 vColor;',
            'varying float vAlpha;',
        ].join('\n');
    }

    getVertexSrc()
    {
        return [
            this.getVertexHeadSrc(),

            'void main(void) {',
            '    vTextureCoord = aTextureCoord;',
            // '    vColor = vec4(uColor.rgb * uColor.a, uColor.a);',
            '    vAlpha = uAlpha;',
            '    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '}',
        ].join('\n');
    }

    getFragmentHeadSrc()
    {
        return [
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            // 'varying vec4 vColor;',
            'varying float vAlpha;',
        ].join('\n');
    }

    getFragmentSrc()
    {
        return [
            this.getFragmentHeadSrc(),

            'void main(void) {',
            // '    gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;',
            '    gl_FragColor = texture2D(uSampler, vTextureCoord) * vAlpha;',
            // // '    vec4 color = texture2D(uSampler, vTextureCoord) * vColor;',
            // '    vec4 color = texture2D(uSampler, vTextureCoord) * uAlpha;',
            // '    if (color.a == 0.0) discard;',
            // '    gl_FragColor = color;',
            '}',
        ].join('\n');
    }
}
