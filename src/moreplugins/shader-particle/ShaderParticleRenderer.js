import glCore from 'pixi-gl-core';
import * as core from '../../core';

import vertex from './default.vert.js';
import fragment from './default.frag.js';

const ObjectRenderer = core.ObjectRenderer;
const WebGLRenderer = core.WebGLRenderer;
const RenderTarget = core.RenderTarget;
const Shader = core.Shader;
const BLEND_MODES = core.BLEND_MODES;

export default class ShaderParticleRenderer extends ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);

        this.blendMode = BLEND_MODES.NORMAL;
        this.renderer.on('prerender', this.onPrerender, this);
    }

    onContextChange()
    {
        this.gl = this.renderer.gl;
        const gl = this.gl;

        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        this.shader = new Shader(gl, vertex, fragment);

        const screen = this.renderer.screen;

        this.renderTarget = new RenderTarget(gl, screen.width, screen.height, null, this.renderer.resolution);

        this.initVao(gl);
    }

    initVao(gl) // eslint-disable-line no-unused-vars
    {
        const shader = this.shader;

        const indicesData = new Uint16Array([0, 1, 2, 0, 3, 2]);
        const indexBuffer = new glCore.GLBuffer.createIndexBuffer(gl, indicesData, gl.STATIC_DRAW);

        const vertCount = 4;

        // aVertexPosition(2), aTextureCoord(2)
        const byteCount = 4;
        const vertSize = 4;
        const vertByteSize = byteCount * vertSize;

        const buff = new ArrayBuffer(vertByteSize * vertCount);
        const posView = new Float32Array(buff);
        const coordView = new Float32Array(buff);

        posView[0] = -1;
        posView[1] = 1;
        coordView[2] = 0;
        coordView[3] = 0;

        posView[4] = -1;
        posView[5] = -1;
        coordView[6] = 0;
        coordView[7] = 1;

        posView[8] = 1;
        posView[9] = -1;
        coordView[10] = 1;
        coordView[11] = 1;

        posView[12] = 1;
        posView[13] = 1;
        coordView[14] = 1;
        coordView[15] = 0;

        const vertexBuffer = new glCore.GLBuffer.createVertexBuffer(gl, buff, gl.STATIC_DRAW);

        const vao = new glCore.VertexArrayObject(gl);
        const attrs = shader.attributes;

        vao.addIndex(indexBuffer);
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, vertByteSize, 8);

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
        if (particle.disabled)
        {
            return;
        }

        const renderer = this.renderer;
        const gl = this.gl;
        const instanceExt = this.instanceExt;

        const display = particle.display;
        const particleCount = particle.count;

        const prevRenderTarget = renderer._activeRenderTarget;

        renderer.bindRenderTarget(this.renderTarget);
        this.renderTarget.clear();

        // re-enable blending so our bunnies look good
        renderer.state.setBlendMode(particle.blendMode);

        display.update(renderer, particle);

        // boom! draw some bunnies
        if (display.useInstanced)
        {
            instanceExt.drawElementsInstancedANGLE(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, particleCount);
        }
        else
        {
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }

        renderer.bindRenderTarget(prevRenderTarget);
        renderer.bindShader(this.shader);
        renderer.bindVao(this.vao);
        particle.bindTargetTexture(renderer, this.renderTarget.texture, 1);
        this.shader.uniforms.uSampler = 1;
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * Destroys the ShaderParticleRenderer.
     *
     */
    destroy()
    {
        super.destroy();

        this.blendMode = null;
        this.instanceExt = null;
        this.gl = null;
    }
}

WebGLRenderer.registerPlugin('shaderparticle', ShaderParticleRenderer);
