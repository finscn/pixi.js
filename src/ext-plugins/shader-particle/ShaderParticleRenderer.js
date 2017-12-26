import glCore from 'pixi-gl-core';
import * as core from '../../core';

import ShaderParticle from './ShaderParticle';

import vertex from './render.vert.js';
import fragment from './render.frag.js';

const ObjectRenderer = core.ObjectRenderer;
const WebGLRenderer = core.WebGLRenderer;
const RenderTarget = core.RenderTarget;
const Shader = core.Shader;
// const settings = core.settings;

/**
 *
 * --== Reserved var-names ==--
 *
 * aVertexPosition
 * aTextureCoord
 * uFlipY
 *
 * uSampler
 *
 * vTextureCoord
 *
 */

export default class ShaderParticleRenderer extends ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);

        this.renderer.on('prerender', this.onPrerender, this);
    }

    onContextChange()
    {
        this.gl = this.renderer.gl;
        const gl = this.gl;

        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        this.shader = this.createShader(gl);

        this.vertCount = 4;
        this.vertSize = 4;

        const screen = this.renderer.screen;

        this.renderTarget = new RenderTarget(gl, screen.width, screen.height, null, this.renderer.resolution);

        this.initVao(gl);
    }

    createShader(gl)
    {
        const shader = new Shader(gl, vertex, fragment);

        return shader;
    }

    initVao(gl, particle) // eslint-disable-line no-unused-vars
    {
        this.indexBufferData = new Uint16Array([0, 1, 2, 0, 3, 2]);

        const vertCount = this.vertCount;
        const vertSize = this.vertSize;

        // aVertexPosition(2), aTextureCoord(2)
        const byteCount = 4;

        this.vertByteSize = byteCount * vertSize;

        this.vertexBufferData = new ArrayBuffer(this.vertByteSize * vertCount);

        const posView = new Float32Array(this.vertexBufferData);
        const coordView = new Float32Array(this.vertexBufferData);

        posView[0] = -1;
        posView[1] = -1;
        coordView[2] = 0;
        coordView[3] = 0;

        posView[4] = -1;
        posView[5] = 1;
        coordView[6] = 0;
        coordView[7] = 1;

        posView[8] = 1;
        posView[9] = 1;
        coordView[10] = 1;
        coordView[11] = 1;

        posView[12] = 1;
        posView[13] = -1;
        coordView[14] = 1;
        coordView[15] = 0;

        this.createVao(gl);
    }

    createVao(gl)
    {
        const vertSize = this.vertSize;

        const indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indexBufferData, gl.STATIC_DRAW);
        const vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.vertexBufferData, gl.STATIC_DRAW);

        const vao = new glCore.VertexArrayObject(gl);
        const attrs = this.shader.attributes;

        vao.addIndex(indexBuffer);
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, this.vertByteSize, 2 * vertSize);

        this.vao = vao;
    }

    /**
     * Called before the renderer starts rendering.
     */
    onPrerender()
    {
        //
    }

    /**
     * Renders the point object.
     *
     * @param {ShaderParticle} particle - the point to render when using this pointbatch
     */
    render(particle)
    {
        if (particle.disabled || !particle.visible)
        {
            return;
        }

        const renderer = this.renderer;
        const gl = this.gl;
        const instanceExt = this.instanceExt;

        const display = particle.display;
        const particleCount = particle.count;
        const prevRenderTarget = renderer._activeRenderTarget;
        const useFramebuffer = particle.useFramebuffer === true
                            || (particle.useFramebuffer !== false && prevRenderTarget.root);

        particle.updateStatus(renderer);

        if (useFramebuffer)
        {
            renderer.bindRenderTarget(this.renderTarget);
            this.renderTarget.clear();
        }
        else if (prevRenderTarget !== renderer._activeRenderTarget)
        {
            renderer.bindRenderTarget(prevRenderTarget);
        }

        // re-enable blending so our bunnies look good
        renderer.state.setBlendMode(particle.blendMode);

        display.update(renderer, particle);

        instanceExt.drawElementsInstancedANGLE(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, particleCount);

        if (useFramebuffer)
        {
            renderer.bindRenderTarget(prevRenderTarget);

            renderer.bindShader(this.shader);
            // if (!settings.CAN_UPLOAD_SAME_BUFFER)
            // {
            //     this.createVao(renderer.gl);
            // }
            renderer.bindVao(this.vao);

            ShaderParticle.bindTargetTexture(renderer, this.renderTarget.texture, 1);
            this.shader.uniforms.uSampler = 1;
            this.shader.uniforms.uFlipY = -1.0;

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Destroys the ShaderParticleRenderer.
     *
     */
    destroy()
    {
        super.destroy();

        this.renderTarget.destroy();
        this.shader.destroy();
        this.vao.destroy();

        this.renderTarget = null;
        this.shader = null;
        this.vao = null;

        this.gl = null;
        this.instanceExt = null;
        this.indexBufferData = null;
        this.vertexBufferData = null;
    }
}

WebGLRenderer.registerPlugin('shaderparticle', ShaderParticleRenderer);
