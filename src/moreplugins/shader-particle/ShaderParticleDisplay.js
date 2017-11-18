import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';

import vertex from './display.vert.js';
import fragment from './display.frag.js';

export default class ShaderParticleDisplay
{

    constructor(vertexSrc, fragmentSrc, fboSize = 1024)
    {
        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc || vertex;
        this.fragmentSrc = fragmentSrc || fragment;
        this.fboSize = fboSize;

        this.useInstanced = true;

        this.useStatus = [0];
    }

    init(gl, particle)
    {
        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);
        this.initVao(gl, particle);
    }

    initVao(gl, particle)
    {
        const instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        const shader = this.shader;
        const fboSize = this.fboSize;

        const particleCount = particle.count;
        const verts = particle.vertexData;
        const texture = particle._texture;
        const frames = particle.frames;

        const attrs = shader.attributes;
        const withFrame = 'aParticleFrame' in attrs;

        const vertCount = 4;
        const vertSize = 4;

        const indicesData = new Uint16Array([0, 1, 2, 0, 3, 2]);
        const indexBuffer = new glCore.GLBuffer.createIndexBuffer(gl, indicesData, gl.STATIC_DRAW);

        // aVertexPosition(2), aTextureCoord(2)
        const byteCount = 4;
        const vertByteSize = byteCount * vertSize;

        const buff = new ArrayBuffer(vertByteSize * vertCount);
        const posView = new Float32Array(buff);
        const coordView = new Float32Array(buff);

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
        const byteCount2 = withFrame ? 6 : 2;
        const vertByteSize2 = byteCount2 * vertSize;

        const perBuff = new ArrayBuffer(vertByteSize2 * particleCount);

        const indicesView = new Float32Array(perBuff);
        let frameView;

        if (withFrame)
        {
            frameView = new Float32Array(perBuff);
        }

        const defaultFrame = particle.defaultFrame;

        let idx = 0;
        let c = 0;
        let r = 0;

        for (let i = 0; i < particleCount; i++)
        {
            indicesView[idx + 0] = c / fboSize;
            indicesView[idx + 1] = r / fboSize;

            if (withFrame)
            {
                const f = frames ? (frames[i] || defaultFrame) : defaultFrame;

                frameView[idx + 2] = f[0];
                frameView[idx + 3] = f[1];
                frameView[idx + 4] = f[2];
                frameView[idx + 5] = f[3];
            }

            idx += byteCount2;
            c++;
            if (c >= fboSize)
            {
                c = 0;
                r++;
            }
        }

        // create a VertexArrayObject - this will hold all the details for rendering the texture
        const vao = new glCore.VertexArrayObject(gl);
        const vertexBuffer = new glCore.GLBuffer.createVertexBuffer(gl, buff, gl.STATIC_DRAW);
        const particleBuffer = new glCore.GLBuffer.createVertexBuffer(gl, perBuff, gl.STATIC_DRAW);

        vao.addIndex(indexBuffer);

        // create some buffers to hold our vertex data
        // the vertex data here does not hold a posiiton of the bunny, but the uv of the pixle in the physics texture
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, vertByteSize, 2 * vertSize);

        if (withFrame)
        {
            vao.addAttribute(particleBuffer, attrs.aParticleIndex, gl.FLOAT, false, vertByteSize2, 0);
            vao.addAttribute(particleBuffer, attrs.aParticleFrame, gl.FLOAT, false, vertByteSize2, 2 * vertSize);
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

        renderer.bindVao(this.vao);
        renderer.bindShader(shader);

        const texture = particle._texture;

        const texLocation = renderer.bindTexture(texture);

        this.shader.uniforms.uTexture = texLocation;

        const statusList = particle.statusList;
        let location = 1;

        this.useStatus.forEach(function (statusIndex)
        {
            const texture = statusList[statusIndex].renderTargetOut.texture;

            particle.bindTargetTexture(renderer, texture, location);
            shader.uniforms['stateTex' + statusIndex] = location;
            location++;
        });

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
        // this.shader.uniforms.timeStep = 1000 / 60;

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
