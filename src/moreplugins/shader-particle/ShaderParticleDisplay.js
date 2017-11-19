import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
// import settings from '../../core/settings';

import vertex from './display.vert.js';
import fragment from './display.frag.js';

export default class ShaderParticleDisplay
{
    constructor(vertexSrc, fragmentSrc, fboWidth, fboHeight)
    {
        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc || vertex;
        this.fragmentSrc = fragmentSrc || fragment;

        this.fboWidth = fboWidth || 0;
        this.fboHeight = fboHeight || 0;

        this.useInstanced = true;
    }

    init(gl, particle)
    {
        this.fboWidth = this.fboWidth || particle.fboWidth;
        this.fboHeight = this.fboHeight || particle.fboHeight;

        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        this.vertCount = 4;
        this.vertSize = 4;

        this.initVao(gl, particle);
    }

    initVao(gl, particle)
    {
        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        const shader = this.shader;
        const fboWidth = this.fboWidth;
        const fboHeight = this.fboHeight;

        const particleCount = particle.count;
        const verts = particle.vertexData;
        const texture = particle._texture;
        const frames = particle.frames;

        const attrs = shader.attributes;

        this.withFrame = 'aParticleFrame' in attrs;
        const withFrame = this.withFrame;

        this.indexBufferData = new Uint16Array([0, 1, 2, 0, 3, 2]);

        const vertCount = this.vertCount;
        const vertSize = this.vertSize;

        // aVertexPosition(2), aTextureCoord(2)
        const byteCount = 4;

        this.vertByteSize = byteCount * vertSize;

        this.vertexBufferData = new ArrayBuffer(this.vertByteSize * vertCount);

        const posView = new Float32Array(this.vertexBufferData);
        const coordView = new Float32Array(this.vertexBufferData);

        const uvs = texture._uvs;

        let offset = 0;

        posView[offset + 0] = verts[0];
        posView[offset + 1] = verts[1];
        coordView[offset + 2] = uvs.x0;
        coordView[offset + 3] = uvs.y0;

        offset += byteCount;

        posView[offset + 0] = verts[2];
        posView[offset + 1] = verts[3];
        coordView[offset + 2] = uvs.x1;
        coordView[offset + 3] = uvs.y1;

        offset += byteCount;

        posView[offset + 0] = verts[4];
        posView[offset + 1] = verts[5];
        coordView[offset + 2] = uvs.x2;
        coordView[offset + 3] = uvs.y2;

        offset += byteCount;

        posView[offset + 0] = verts[6];
        posView[offset + 1] = verts[7];
        coordView[offset + 2] = uvs.x3;
        coordView[offset + 3] = uvs.y3;

        // aParticleIndex(2) , aFrame(4)
        const byteCountPer = withFrame ? 6 : 2;

        this.vertByteSizePer = byteCountPer * vertSize;

        this.particleBufferData = new ArrayBuffer(this.vertByteSizePer * particleCount);

        const indicesView = new Float32Array(this.particleBufferData);
        let frameView;

        if (withFrame)
        {
            frameView = new Float32Array(this.particleBufferData);
        }

        const defaultFrame = particle.defaultFrame;

        let idx = 0;
        let c = 0;
        let r = 0;

        for (let i = 0; i < particleCount; i++)
        {
            indicesView[idx + 0] = c / fboWidth;
            indicesView[idx + 1] = r / fboHeight;

            if (withFrame)
            {
                const f = frames ? (frames[i] || defaultFrame) : defaultFrame;

                frameView[idx + 2] = f[0];
                frameView[idx + 3] = f[1];
                frameView[idx + 4] = f[2];
                frameView[idx + 5] = f[3];
            }

            idx += byteCountPer;
            c++;
            if (c >= fboWidth)
            {
                c = 0;
                r++;
            }
        }

        this.createVao(gl);
    }

    createVao(gl)
    {
        const vertSize = this.vertSize;

        const attrs = this.shader.attributes;
        const withFrame = this.withFrame;

        const instanceExt = this.instanceExt;

        const indexBuffer = new glCore.GLBuffer.createIndexBuffer(gl, this.indexBufferData, gl.STATIC_DRAW);

        // create a VertexArrayObject - this will hold all the details for rendering the texture
        const vao = new glCore.VertexArrayObject(gl);
        const vertexBuffer = new glCore.GLBuffer.createVertexBuffer(gl, this.vertexBufferData, gl.STATIC_DRAW);
        const particleBuffer = new glCore.GLBuffer.createVertexBuffer(gl, this.particleBufferData, gl.STATIC_DRAW);

        vao.addIndex(indexBuffer);

        // create some buffers to hold our vertex data
        // the vertex data here does not hold a posiiton of the bunny, but the uv of the pixle in the physics texture
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, this.vertByteSize, 2 * vertSize);

        if (withFrame)
        {
            vao.addAttribute(particleBuffer, attrs.aParticleIndex, gl.FLOAT, false, this.vertByteSizePer, 0);
            vao.addAttribute(particleBuffer, attrs.aParticleFrame, gl.FLOAT, false, this.vertByteSizePer, 2 * vertSize);
            vao.bind();
            instanceExt.vertexAttribDivisorANGLE(attrs.aParticleIndex.location, 1);
            instanceExt.vertexAttribDivisorANGLE(attrs.aParticleFrame.location, 1);
        }
        else
        {
            vao.addAttribute(particleBuffer, attrs.aParticleIndex);
            vao.bind();
            instanceExt.vertexAttribDivisorANGLE(attrs.aParticleIndex.location, 1);
        }

        this.vao = vao;
    }

    update(renderer, particle)
    {
        const shader = this.shader;

        renderer.bindShader(shader);
        // if (!settings.CAN_UPLOAD_SAME_BUFFER)
        // {
        //     this.createVao(renderer.gl);
        // }
        renderer.bindVao(this.vao);

        const texture = particle._texture;

        const texLocation = renderer.bindTexture(texture);

        this.shader.uniforms.uTexture = texLocation;

        const statusList = particle.statusList;

        if (statusList)
        {
            let location = 1;

            particle.useStatus.forEach(function (statusIndex)
            {
                const texture = statusList[statusIndex].renderTargetOut.texture;

                particle.bindTargetTexture(renderer, texture, location);
                shader.uniforms['stateTex' + statusIndex] = location;
                location++;
            });
        }

        shader.uniforms.uTime = particle.time;
        shader.uniforms.uTimeStep = particle.timeStep;

        shader.uniforms.uAlpha = particle.alpha;
        shader.uniforms.uColorMultiplier = particle.colorMultiplier;
        shader.uniforms.uColorOffset = particle.colorOffset;

        const pos = shader.uniforms.uPosition;

        if (pos)
        {
            pos[0] = particle.position.x;
            pos[1] = particle.position.y;
            shader.uniforms.uPosition = pos;
        }

        this.updateShader(renderer, particle);
    }

    updateShader(renderer, particle)  // eslint-disable-line no-unused-vars
    {
        // const statusList = particle.statusList;

        // ==========================================
        //
        //
        //
        //

        // other params
        // this.shader.uniforms.foo = foo;

        //
        //
        //
        //
        // ==========================================
    }

    /**
     * Destroys the ShaderParticleDisplay.
     *
     */
    destroy()
    {
        // TODO
    }
}
