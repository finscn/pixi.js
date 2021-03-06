import * as core from '../../core';
import glCore from 'pixi-gl-core';
import { default as Mesh } from '../Mesh';
import { readFileSync } from 'fs';
import { join } from 'path';

const matrixIdentity = core.Matrix.IDENTITY;

/**
 * WebGL renderer plugin for tiling sprites
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 */
export default class MeshRenderer extends core.ObjectRenderer
{

    /**
     * constructor for renderer
     *
     * @param {WebGLRenderer} renderer The renderer this tiling awesomeness works for.
     */
    constructor(renderer)
    {
        super(renderer);

        this.shader = null;
    }

    /**
     * Sets up the renderer context and necessary buffers.
     *
     * @private
     */
    onContextChange()
    {
        const gl = this.renderer.gl;

        const parseColor = core.settings.PARSE_COLOR || '';
        let fragSrc = readFileSync(join(__dirname, './mesh.frag'), 'utf8');
        let trimFragSrc = readFileSync(join(__dirname, './mesh_trim.frag'), 'utf8');

        fragSrc = fragSrc.replace('${parseColor}', parseColor);
        trimFragSrc = trimFragSrc.replace('${parseColor}', parseColor);

        this.shader = new core.Shader(gl,
            readFileSync(join(__dirname, './mesh.vert'), 'utf8'),
            fragSrc
            );
        this.shaderTrim = new core.Shader(gl,
            readFileSync(join(__dirname, './mesh.vert'), 'utf8'),
            trimFragSrc
            );
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
        const isTrimmed = texture.trim && (texture.trim.width < texture.orig.width
            || texture.trim.height < texture.orig.height);
        const shader = isTrimmed ? this.shaderTrim : this.shader;

        if (!glData)
        {
            renderer.bindVao(null);

            glData = {
                vertexBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
                uvBuffer: glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
                indexBuffer: glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: null,
                dirty: mesh.dirty,
                indexDirty: mesh.indexDirty,
                vertexDirty: mesh.vertexDirty,
            };

            // build the vao object that will render..
            glData.vao = new glCore.VertexArrayObject(gl)
                .addIndex(glData.indexBuffer)
                .addAttribute(glData.vertexBuffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                .addAttribute(glData.uvBuffer, shader.attributes.aTextureCoord, gl.FLOAT, false, 2 * 4, 0);

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

        if (mesh.vertexDirty !== glData.vertexDirty)
        {
            glData.vertexDirty = mesh.vertexDirty;
            glData.vertexBuffer.upload(mesh.vertices);
        }

        renderer.bindShader(shader);

        shader.uniforms.uSampler = renderer.bindTexture(texture);

        renderer.state.setBlendMode(core.utils.correctBlendMode(mesh.blendMode, texture.baseTexture.premultipliedAlpha));

        if (shader.uniforms.uTransform)
        {
            if (mesh.uploadUvTransform)
            {
                shader.uniforms.uTransform = mesh._uvTransform.mapCoord.toArray(true);
            }
            else
            {
                shader.uniforms.uTransform = matrixIdentity.toArray(true);
            }
        }
        if (isTrimmed)
        {
            shader.uniforms.uClampFrame = mesh._uvTransform.uClampFrame;
        }
        shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);

        shader.uniforms.uColor = core.utils.premultiplyRgba(mesh.tintRgb,
            mesh.worldAlpha, shader.uniforms.uColor, texture.baseTexture.premultipliedAlpha);
        shader.uniforms.uColorMultiplier = mesh.colorMultiplier;

        const drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

        glData.vao.draw(drawMode, mesh.indices.length, 0);
    }
}

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);
