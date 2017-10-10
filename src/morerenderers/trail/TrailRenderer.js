import * as core from '../../core';
import glCore from 'pixi-gl-core';
import * as mesh from '../../mesh';
import vertex from './trail.vert.js';
import fragment from './trail.frag.js';

// const ObjectRenderer = core.ObjectRenderer;
const WebGLRenderer = core.WebGLRenderer;
const Shader = core.Shader;
const MeshRenderer = mesh.MeshRenderer;
const Mesh = mesh.Mesh;

export default class TrailRenderer extends MeshRenderer
{
    constructor(renderer)
    {
        super(renderer);
        this.gl = renderer.gl;
        this.shader = null;
        this.viewSize = null;
        this.worldTime = 0;
    }

    onContextChange()
    {
        const gl = this.renderer.gl;

        this.viewSize = new Float32Array([
            this.renderer.width,
            this.renderer.height,
        ]);

        this.shader = this.generateShader(gl);
    }

    generateShader(gl)
    {
        const shader = new Shader(gl, vertex, fragment);

        return shader;
    }

    /**
     * renders mesh
     *
     * @param {PIXI.mesh.Mesh} mesh mesh instance
     */
    render(mesh)
    {
        const renderer = this.renderer;
        const gl = renderer.gl;
        const texture = mesh._texture;

        if (!texture.valid)
        {
            return;
        }

        let glData = mesh._glDatas[renderer.CONTEXT_UID];

        if (!glData)
        {
            renderer.bindVao(null);

            glData = {
                shader: this.shader,
                vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
                uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
                indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: null,
                dirty: mesh.dirty,
                indexDirty: mesh.indexDirty,
            };

            // build the vao object that will render..
            glData.vao = new glCore.VertexArrayObject(gl)
                .addIndex(glData.indexBuffer)
                .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                .addAttribute(glData.uvBuffer, glData.shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);

            mesh._glDatas[renderer.CONTEXT_UID] = glData;
        }

        renderer.bindVao(glData.vao);

        if (mesh.dirty !== glData.dirty)
        {
            glData.dirty = mesh.dirty;
            glData.uvBuffer.upload(mesh.uvs);
        }

        if (mesh.indexDirty !== glData.indexDirty)
        {
            glData.indexDirty = mesh.indexDirty;
            glData.indexBuffer.upload(mesh.indices);
        }

        glData.vertexBuffer.upload(mesh.vertices);

        renderer.bindShader(glData.shader);

        glData.shader.uniforms.uSampler = renderer.bindTexture(texture);

        renderer.state.setBlendMode(mesh.blendMode);

        glData.shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);
        glData.shader.uniforms.alpha = mesh.worldAlpha;
        glData.shader.uniforms.tint = mesh.tintRgb;

        glData.shader.uniforms.viewSize = this.viewSize;
        glData.shader.uniforms.worldTime = mesh.worldTime || 0;

        const drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

        glData.vao.draw(drawMode, mesh.indices.length, 0);
    }
}

WebGLRenderer.registerPlugin('trail', TrailRenderer);
