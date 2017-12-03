import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
import RenderTarget from '../../core/renderers/webgl/utils/RenderTarget';
import { SCALE_MODES } from '../../core/const';
// import settings from '../../core/settings';

import ShaderParticle from './ShaderParticle';
import ShaderParticleProcessor from './ShaderParticleProcessor';

import vertex from './status.vert.js';
import fragment from './status.frag.js';

const tempDatas = {};

/**
 *
 * --== Reserved var-names ==--
 *
 * aVertexPosition
 * aTextureCoord
 *
 * uStatusOut + N
 * uStatusIn
 * uViewSize
 * uFboSize
 * uParticleCount
 *
 * vTextureCoord
 *
 */

export default class ShaderParticleStatus extends ShaderParticleProcessor
{
    constructor(vertexSrc, fragmentSrc, initialData, fboWidth, fboHeight)
    {
        super();

        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc || vertex;
        this.fragmentSrc = fragmentSrc || fragment;
        this.uniforms = null;

        this.initialData = initialData || null;
        this.fboWidth = fboWidth || 0;
        this.fboHeight = fboHeight || 0;

        this.updateCount = 0;
        this.once = false;
        this.disabled = false;
    }

    init(gl, particle)
    {
        this.fboWidth = this.fboWidth || particle.fboWidth;
        this.fboHeight = this.fboHeight || particle.fboHeight;
        this.fboSize = new Float32Array([this.fboWidth, this.fboHeight]);
        this.viewSize = new Float32Array([0.0, 0.0]);

        this.uniforms = this.uniforms || particle.statusUniforms;
        this.attributes = this.attributes || particle.statusAttributes;

        this.vertCount = 4;
        this.vertSize = 4;

        this.shader = this.createShader(gl);

        let data = null;
        const size = this.fboWidth * this.fboHeight;

        if (this.initialData)
        {
            data = this.initialData;
        }
        else
        {
            data = tempDatas[size];
            if (!data)
            {
                data = new Float32Array(4 * size);
                tempDatas[size] = data;
            }
        }

        const format = particle.format;
        const outData = format === 'FLOAT' ? data : null;

        this.initialTarget = this.createRenderTarget(gl, data, format);
        this.renderTargetOut = this.createRenderTarget(gl, outData, format);
        this._renderTargetOut = this.createRenderTarget(gl, outData, format);

        this.initialTarget.initial = true;
        this.renderTargetIn = this.initialTarget;

        this.initVao(gl, particle);
    }

    createShader(gl)
    {
        const shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        return shader;
    }

    initAttributes(gl, particle) // eslint-disable-line no-unused-vars
    {
        // nothing to do
    }

    initVertexBufferData(gl, particle) // eslint-disable-line no-unused-vars
    {
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
    }

    initParticleBufferData(gl, particle) // eslint-disable-line no-unused-vars
    {
        // nothing to do
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

    createRenderTarget(gl, data, format)
    {
        const fboWidth = this.fboWidth;
        const fboHeight = this.fboHeight;
        const renderTarget = new RenderTarget(gl, fboWidth, fboHeight, SCALE_MODES.NEAREST);

        const frameBuffer = this.createFrameBuffer(gl, fboWidth, fboHeight, data, format);

        renderTarget.frameBuffer = frameBuffer;
        frameBuffer.texture.enableNearestScaling();
        renderTarget.texture = frameBuffer.texture;

        return renderTarget;
    }

    createFrameBuffer(gl, width, height, data, format)
    {
        if (format === 'RGBA')
        {
            return ShaderParticle.createRGBAFrameBuffer(gl, width, height, data);
        }

        const extFloat = gl.getExtension('OES_texture_float');

        if (format === 'FLOAT' && extFloat)
        {
            return ShaderParticle.createFloatFrameBuffer(gl, width, height, data);
        }

        const extHalfFloat = gl.getExtension('OES_texture_half_float');

        if (format === 'HALF_FLOAT' && extHalfFloat)
        {
            return ShaderParticle.createHalfFloatFrameBuffer(gl, width, height, data, extHalfFloat);
        }

        // Auto
        if (extHalfFloat && extFloat)
        {
            if (data)
            {
                return ShaderParticle.createFloatFrameBuffer(gl, width, height, data);
            }

            return ShaderParticle.createHalfFloatFrameBuffer(gl, width, height, data, extHalfFloat);
        }

        if (extHalfFloat)
        {
            return ShaderParticle.createHalfFloatFrameBuffer(gl, width, height, data, extHalfFloat);
        }

        if (extFloat)
        {
            return ShaderParticle.createFloatFrameBuffer(gl, width, height, data);
        }

        // !extHalfFloat && !extFloat
        return ShaderParticle.createRGBAFrameBuffer(gl, width, height, data);
    }

    uploadInitialData(initialData)
    {
        this.initialData = initialData;

        if (this.initialTarget)
        {
            this.initialTarget.texture.uploadData(initialData, this.fboWidth, this.fboHeight);
        }
    }

    update(renderer, particle) // eslint-disable-line no-unused-vars
    {
        if (this.once && this.updateCount > 0 || this.disabled)
        {
            return;
        }

        const gl = renderer.gl;
        // const instanceExt = this.instanceExt;
        const shader = this.shader;

        renderer.bindShader(shader);
        // if (!settings.CAN_UPLOAD_SAME_BUFFER)
        // {
        //     this.createVao(renderer.gl);
        // }
        renderer.bindVao(this.vao);

        ShaderParticle.bindTargetTexture(renderer, this.renderTargetIn.texture, 0);
        shader.uniforms.uStatusIn = 0;

        this.updateShaderCommonUniforms(renderer, particle);
        this.updateShader(renderer, particle);

        // bind output texture;
        renderer.bindRenderTarget(this.renderTargetOut);

        gl.disable(gl.BLEND);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.BLEND);

        this.updateCount++;
    }

    swapRenderTarget()
    {
        const tmp = this.renderTargetIn;

        this.renderTargetIn = this.renderTargetOut;
        this.renderTargetOut = tmp.initial ? this._renderTargetOut : tmp;
    }

    /**
     * Destroys the ShaderParticleStatus.
     *
     */
    destroy()
    {
        super.destroy();

        this.initialTarget.destroy();
        this.renderTargetIn.destroy();
        this.renderTargetOut.destroy();

        this.initialTarget = null;
        this.renderTargetIn = null;
        this.renderTargetOut = null;
        this._renderTargetOut = null;

        this.initialData = null;
        // TODO
    }
}
