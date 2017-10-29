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
        this.useNormalVertices = false;
        this.autoProject = true;
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
        if (args)
        {
            // noop
        }
        const vertexSrc = this.getVertexSrc();
        const fragmentSrc = this.getFragmentSrc();
        const shader = new Shader(gl, vertexSrc, fragmentSrc);

        return shader;
    }

    render(sprite)
    {
        if (!sprite._texture._uvs)
        {
            return;
        }

        const renderer = this.renderer;
        const shader = this.shader;
        const quad = this.quad;

        const texture = sprite._texture.baseTexture;

        const vertexData = sprite.computedGeometry ? sprite.computedGeometry.vertices : sprite.vertexData;
        const uvsData = sprite._texture._uvs;

        const vertices = quad.vertices;
        const uvs = quad.uvs;

        if (this.useNormalVertices)
        {
            // TODO  normal != uvs , uvs of texture !!!
            vertices[0] = 0;
            vertices[1] = 0;
            vertices[2] = 1;
            vertices[3] = 0;
            vertices[4] = 1;
            vertices[5] = 1;
            vertices[6] = 0;
            vertices[7] = 1;
        }
        else
        {
            for (let i = 0; i < 8; i++)
            {
                vertices[i] = vertexData[i];
            }
        }

        uvs[0] = uvsData.x0;
        uvs[1] = uvsData.y0;
        uvs[2] = uvsData.x1;
        uvs[3] = uvsData.y1;
        uvs[4] = uvsData.x2;
        uvs[5] = uvsData.y2;
        uvs[6] = uvsData.x3;
        uvs[7] = uvsData.y3;
        quad.upload();

        renderer.bindShader(this.shader, this.autoProject);
        renderer.bindVao(quad.vao);

        // const tint = sprite._tintRGB + (sprite.worldAlpha * 255 << 24);
        // const color = tempArray;
        // core.utils.hex2rgb(sprite._tint, color);
        // color[3] = sprite.worldAlpha;
        // shader.uniforms.uColor = color;
        shader.uniforms.uAlpha = sprite.worldAlpha;

        this.updateShaderParameters(renderer, shader, sprite);

        renderer.bindTexture(texture, this.textureLocation);
        renderer.state.setBlendMode(sprite.blendMode);

        this.quad.vao.draw(renderer.gl.TRIANGLES, 6, 0);
    }

    updateShaderParameters(renderer, shader, sprite)
    {
        // implemented by subclass
        if (!renderer || !shader || !sprite)
        {
            return;
        }
    }

    getVertexSrc()
    {
        return `
            attribute vec2 aVertexPosition;
            attribute vec2 aTextureCoord;
            uniform mat3 projectionMatrix;
            uniform float uAlpha;
            varying vec2 vTextureCoord;

            void main(void) {
                gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
                vTextureCoord = aTextureCoord;
            }
        `;
    }

    getFragmentSrc()
    {
        return `
            uniform sampler2D uSampler;
            varying vec2 vTextureCoord;
            uniform float uAlpha;

            void main(void) {
                gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;
            }
        `;
    }
}
