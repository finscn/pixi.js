import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';

export default class ShaderParticleStatus
{
    constructor(vertexSrc, fragmentSrc, fboSize = 1024, data)
    {
        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc;
        this.fragmentSrc = fragmentSrc;
        this.fboSize = fboSize;
        this.fboBuffer = data;
    }

    init(gl, particleGroup)
    {
        this.gl = gl;
        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        const fboSize = this.fboSize;

        this.fbo1 = glCore.GLFramebuffer.createFloat32(gl, fboSize, fboSize, this.fboBuffer);
        this.fbo2 = glCore.GLFramebuffer.createFloat32(gl, fboSize, fboSize, this.fboBuffer);
        this.fboOut = this.fbo2;
        this.initVao(particleGroup);
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

    initVao(particleGroup) // eslint-disable-line no-unused-vars
    {
        const gl = this.gl;
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
        this.fbo1.texture.uploadData(data, fboSize, fboSize);
        // this.fbo2.texture.uploadData(data, fboSize, fboSize);
    }

    update(particleGroup, timeStep, now) // eslint-disable-line no-unused-vars
    {
        const gl = this.gl;
        // const instanceExt = this.instanceExt;
        const shader = this.shader;

        shader.bind();

        this.updateShader(particleGroup, timeStep, now);

        // bind output texture;
        this.fbo2.bind();
        this.vao.bind();

        gl.disable(gl.BLEND);
        gl.viewport(0, 0, this.fboSize, this.fboSize);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        this.fbo2.unbind();

        this.fboOut = this.fbo2;
    }

    updateShader(particleGroup, timeStep, now) // eslint-disable-line no-unused-vars
    {
        // ==========================================
        //
        //
        //
        //

        // bind input textures;
        this.fbo1.texture.bind(0);
        // particleGroup.statusList[0].fboOut.texture.bind(1);
        // particleGroup.statusList[1].fboOut.texture.bind(2);

        // textures
        this.shader.uniforms.positionTex = 0;
        // this.shader.uniforms.tex1 = 1;
        // this.shader.uniforms.tex2 = 2;

        // other params
        this.shader.uniforms.timeStep = 1000 / 60;

        //
        //
        //
        //
        // ==========================================
    }

    swapFbo()
    {
        const tmp = this.fbo1;

        this.fbo1 = this.fbo2;
        this.fbo2 = tmp;
    }

    /**
     * Destroys the ShaderParticleStatus.
     *
     */
    destroy()
    {
        this.fboOut = null;
        // TODO
    }
}
