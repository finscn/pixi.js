import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
import RenderTarget from '../../core/renderers/webgl/utils/RenderTarget';
import { SCALE_MODES } from '../../core/const';

import vertex from './status.vert.js';
import fragment from './status.frag.js';

const tempDatas = {};

export default class ShaderParticleStatus
{
    constructor(vertexSrc, fragmentSrc, fboSize = 1024, data)
    {
        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc || vertex;
        this.fragmentSrc = fragmentSrc || fragment;
        this.fboSize = fboSize;
        this.fboBuffer = data;
    }

    init(gl, particleGroup)
    {
        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        const fboSize = this.fboSize;
        let data = null;

        if (this.fboBuffer)
        {
            data = this.fboBuffer;
        }
        else
        {
            data = tempDatas[fboSize];
            if (!data)
            {
                data = new Float32Array(4 * fboSize * fboSize);
                tempDatas[fboSize] = data;
            }
        }

        this.renderTargetIn = this.createRenderTarget(gl, data);
        this.renderTargetOut = this.createRenderTarget(gl, data);

        this.initVao(gl, particleGroup);
    }

    createRenderTarget(gl, data)
    {
        const fboSize = this.fboSize;
        const renderTarget = new RenderTarget(gl, fboSize, fboSize, SCALE_MODES.NEAREST);
        const frameBuffer = glCore.GLFramebuffer.createFloat32(gl, fboSize, fboSize, data);

        renderTarget.frameBuffer = frameBuffer;
        frameBuffer.texture.enableNearestScaling();
        renderTarget.texture = frameBuffer.texture;

        return renderTarget;
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

    initVao(gl, particleGroup) // eslint-disable-line no-unused-vars
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

    uploadData(data)
    {
        const fboSize = this.fboSize;

        this.fboBuffer = data;
        this.renderTargetIn.texture.uploadData(data, fboSize, fboSize);
    }

    update(renderer, particleGroup, timeStep, now) // eslint-disable-line no-unused-vars
    {
        const gl = renderer.gl;
        // const instanceExt = this.instanceExt;
        const shader = this.shader;

        renderer.bindVao(this.vao);
        renderer.bindShader(shader);

        particleGroup.bindTexture(renderer, this.renderTargetIn.texture, 0);
        shader.uniforms.uTextureIn = 0;

        const viewSize = shader.uniforms.viewSize;

        if (viewSize)
        {
            viewSize[0] = renderer.width;
            viewSize[1] = renderer.height;
            shader.uniforms.viewSize = viewSize;
        }

        this.updateShader(renderer, particleGroup, timeStep, now);

        // bind output texture;
        renderer.bindRenderTarget(this.renderTargetOut);

        gl.disable(gl.BLEND);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        gl.enable(gl.BLEND);
    }

    updateShader(renderer, particleGroup, timeStep, now) // eslint-disable-line no-unused-vars
    {
        // ==========================================
        //
        //
        //
        //

        // bind input textures;

        // particleGroup.statusList[0].renderTargetOut.texture.bind(1);
        // particleGroup.statusList[1].renderTargetOut.texture.bind(2);

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
