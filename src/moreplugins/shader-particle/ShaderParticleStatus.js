import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
import RenderTarget from '../../core/renderers/webgl/utils/RenderTarget';
import { SCALE_MODES } from '../../core/const';

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
        this.fboData = null;
    }

    init(gl, particle)
    {
        this.fboWidth = this.fboWidth || particle.fboWidth;
        this.fboHeight = this.fboHeight || particle.fboHeight;

        this.fboData = particle.data;

        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        let data = null;

        if (this.fboData)
        {
            data = this.fboData;
        }
        else
        {
            const size = this.fboWidth * this.fboHeight;

            data = tempDatas[size];
            if (!data)
            {
                data = new Float32Array(4 * size);
                tempDatas[size] = data;
            }
        }

        this.renderTargetIn = this.createRenderTarget(gl, data);
        this.renderTargetOut = this.createRenderTarget(gl, data);

        this.initVao(gl, particle);
    }

    createRenderTarget(gl, data)
    {
        const fboWidth = this.fboWidth;
        const fboHeight = this.fboHeight;
        const renderTarget = new RenderTarget(gl, fboWidth, fboHeight, SCALE_MODES.NEAREST);
        const frameBuffer = glCore.GLFramebuffer.createFloat32(gl, fboWidth, fboHeight, data);

        renderTarget.frameBuffer = frameBuffer;
        frameBuffer.texture.enableNearestScaling();
        renderTarget.texture = frameBuffer.texture;

        return renderTarget;
    }

    uploadData(data)
    {
        this.fboData = data;

        if (this.renderTargetIn)
        {
            this.renderTargetIn.texture.uploadData(data, this.fboWidth, this.fboHeight);
        }

        if (this.renderTargetOut)
        {
            this.renderTargetOut.texture.uploadData(data, this.fboWidth, this.fboHeight);
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

        const vertexBuffer = new glCore.GLBuffer.createVertexBuffer(gl, buff, gl.STATIC_DRAW);

        const vao = new glCore.VertexArrayObject(gl);
        const attrs = shader.attributes;

        vao.addIndex(indexBuffer);
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, vertByteSize, 8);

        this.vao = vao;
    }

    update(renderer, particle, timeStep, now) // eslint-disable-line no-unused-vars
    {
        const gl = renderer.gl;
        // const instanceExt = this.instanceExt;
        const shader = this.shader;

        renderer.bindShader(shader);
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

        this.updateShader(renderer, particle, timeStep, now);

        // bind output texture;
        renderer.bindRenderTarget(this.renderTargetOut);

        gl.disable(gl.BLEND);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.BLEND);
    }

    updateShader(renderer, particle, timeStep, now) // eslint-disable-line no-unused-vars
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
        this.shader.uniforms.timeStep = timeStep;
        this.shader.uniforms.time = now;

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
        this.renderTargetOut = tmp;
    }

    /**
     * Destroys the ShaderParticleStatus.
     *
     */
    destroy()
    {
        this.renderTargetOut = null;
        // TODO
    }
}
