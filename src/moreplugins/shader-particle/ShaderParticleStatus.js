import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
import RenderTarget from '../../core/renderers/webgl/utils/RenderTarget';
import { SCALE_MODES } from '../../core/const';
// import settings from '../../core/settings';

import vertex from './status.vert.js';
import fragment from './status.frag.js';

const tempDatas = {};

export default class ShaderParticleStatus
{
    constructor(vertexSrc, fragmentSrc, fboWidth, fboHeight)
    {
        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc || vertex;
        this.fragmentSrc = fragmentSrc || fragment;

        this.fboWidth = fboWidth || 0;
        this.fboHeight = fboHeight || 0;
        this.initialData = null;
    }

    init(gl, particle)
    {
        this.fboWidth = this.fboWidth || particle.fboWidth;
        this.fboHeight = this.fboHeight || particle.fboHeight;

        this.initialData = particle.data;

        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        this.vertCount = 4;
        this.vertSize = 4;

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

        this.initialTarget = this.createRenderTarget(gl, data);
        this.initialTarget.initial = true;
        this.renderTargetIn = this.initialTarget;
        if (particle.useHalfFloat)
        {
            this.renderTargetOut = this.createRenderTarget(gl);
            this._renderTargetOut = this.createRenderTarget(gl);
        }
        else
        {
            this.renderTargetOut = this.createRenderTarget(gl, data);
            this._renderTargetOut = this.createRenderTarget(gl, data);
        }

        this.initVao(gl, particle);
    }

    createRenderTarget(gl, data)
    {
        const fboWidth = this.fboWidth;
        const fboHeight = this.fboHeight;
        const renderTarget = new RenderTarget(gl, fboWidth, fboHeight, SCALE_MODES.NEAREST);

        const ext = gl.getExtension('OES_texture_half_float');

        let frameBuffer;

        if (data || !ext)
        {
            frameBuffer = glCore.GLFramebuffer.createFloat32(gl, fboWidth, fboHeight, data);
        }
        else
        {
            const texture = new glCore.GLTexture(gl);

            texture.bind();
            texture.type = ext.HALF_FLOAT_OES;
            texture.fromat = gl.RGBA;
            texture.width = fboWidth;
            texture.height = fboHeight;

            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
            gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, fboWidth, fboHeight, 0, texture.format, texture.type, null);

            texture.enableNearestScaling();
            texture.enableWrapClamp();

            // now create the framebuffer object and attach the texture to it.
            frameBuffer = new glCore.GLFramebuffer(gl, fboWidth, fboHeight);
            frameBuffer.enableTexture(texture);

            frameBuffer.unbind();
        }

        renderTarget.frameBuffer = frameBuffer;
        frameBuffer.texture.enableNearestScaling();
        renderTarget.texture = frameBuffer.texture;

        return renderTarget;
    }

    uploadData(data)
    {
        this.initialData = data;

        if (this.initialTarget)
        {
            this.initialTarget.texture.uploadData(data, this.fboWidth, this.fboHeight);
        }
    }

    // the same uvs/frame  --- one array
    // the same vertices  --- one array

    // the same alpha --- uniform
    // the same colorMultiplier --- uniform
    // the same colorOffset --- uniform
    // ``` color * colorMultiplier + colorOffset ```

    // position
    // rotation
    // scaleX , scaleY

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

        const indexBuffer = new glCore.GLBuffer.createIndexBuffer(gl, this.indexBufferData, gl.STATIC_DRAW);

        const vertexBuffer = new glCore.GLBuffer.createVertexBuffer(gl, this.vertexBufferData, gl.STATIC_DRAW);

        const vao = new glCore.VertexArrayObject(gl);
        const attrs = this.shader.attributes;

        vao.addIndex(indexBuffer);
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, this.vertByteSize, 2 * vertSize);

        this.vao = vao;
    }

    update(renderer, particle) // eslint-disable-line no-unused-vars
    {
        const gl = renderer.gl;
        // const instanceExt = this.instanceExt;
        const shader = this.shader;

        renderer.bindShader(shader);
        // if (!settings.CAN_UPLOAD_SAME_BUFFER)
        // {
        //     this.createVao(renderer.gl);
        // }
        renderer.bindVao(this.vao);

        particle.bindTargetTexture(renderer, this.renderTargetIn.texture, 0);
        shader.uniforms.uTextureIn = 0;
        shader.uniforms.particleCount = particle.count;
        shader.uniforms.fboWidth = this.fboWidth;
        shader.uniforms.fboHeight = this.fboHeight;

        const viewSize = shader.uniforms.viewSize;

        if (viewSize)
        {
            viewSize[0] = renderer.width;
            viewSize[1] = renderer.height;
            shader.uniforms.viewSize = viewSize;
        }

        shader.uniforms.uTime = particle.time;
        shader.uniforms.uTimeStep = particle.timeStep;

        this.updateShader(renderer, particle);

        // bind output texture;
        renderer.bindRenderTarget(this.renderTargetOut);

        gl.disable(gl.BLEND);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.BLEND);
    }

    updateShader(renderer, particle) // eslint-disable-line no-unused-vars
    {
        // ==========================================
        //
        //
        //
        //

        // bind input textures;

        // particle.statusList[0].renderTargetOut.texture.bind(1);
        // particle.statusList[1].renderTargetOut.texture.bind(2);

        // textures
        // this.shader.uniforms.tex1 = 1;
        // this.shader.uniforms.tex2 = 2;

        // other params
        // this.shader.uniforms.foo = foo;
        // this.shader.uniforms.bar = bar;

        //
        //
        //
        //
        // ==========================================
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
        this.initialTarget.destroy();
        this.renderTargetIn.destroy();
        this.renderTargetOut.destroy();
        this.shader.destroy();
        this.vao.destroy();

        this.initialTarget = null;
        this.renderTargetIn = null;
        this.renderTargetOut = null;
        this._renderTargetOut = null;
        this.shader = null;
        this.vao = null;

        this.initialData = null;
        this.instanceExt = null;
        this.indexBufferData = null;
        this.vertexBufferData = null;
        this.particleBufferData = null;
        // TODO
    }
}