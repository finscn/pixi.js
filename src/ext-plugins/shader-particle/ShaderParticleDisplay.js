import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
// import settings from '../../core/settings';

import ShaderParticle from './ShaderParticle';
import ShaderParticleProcessor from './ShaderParticleProcessor';

import vertex from './display.vert.js';
import fragment from './display.frag.js';

/**
 *
 * --== Reserved var-names ==--
 *
 * projectionMatrix
 * aVertexPosition
 * aTextureCoord
 * aParticleIndex
 * uPosition
 * uStatusOut + N
 *
 * uSampler
 * uAlpha
 * uColorMultiplier
 * uColorOffset
 *
 * vTextureCoord
 *
 */

export default class ShaderParticleDisplay extends ShaderParticleProcessor
{
    constructor(vertexSrc, fragmentSrc, fboWidth, fboHeight)
    {
        super();

        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc || vertex;
        this.fragmentSrc = fragmentSrc || fragment;
        this.uniforms = null;

        this.fboWidth = fboWidth || 0;
        this.fboHeight = fboHeight || 0;
    }

    init(gl, particle)
    {
        this.fboWidth = this.fboWidth || particle.fboWidth;
        this.fboHeight = this.fboHeight || particle.fboHeight;
        this.fboSize = new Float32Array([this.fboWidth, this.fboHeight]);
        this.viewSize = new Float32Array([0.0, 0.0]);

        this.uniforms = this.uniforms || particle.displayUniforms;
        this.attributes = this.attributes || particle.displayAttributes;

        this.vertCount = 4;
        this.vertSize = 4;

        this.shader = this.createShader(gl);

        this.initVao(gl, particle);
    }

    createShader(gl)
    {
        const shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        return shader;
    }

    createVao(gl)
    {
        const instanceExt = this.instanceExt;

        const vertSize = this.vertSize;
        const vertexStrideSize = this.vertexStride * vertSize;
        const particleStrideSize = this.particleStride * vertSize;

        const vao = new glCore.VertexArrayObject(gl);

        const indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indexBufferData, gl.STATIC_DRAW);
        const vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.vertexBufferData, gl.STATIC_DRAW);
        const particleBuffer = glCore.GLBuffer.createVertexBuffer(gl, this.particleBufferData, gl.STATIC_DRAW);

        vao.addIndex(indexBuffer);

        this.vertexAttributes.forEach(function (a)
        {
            vao.addAttribute(vertexBuffer, a.attribute, a.type, a.normalized, vertexStrideSize, a.offset * vertSize);
        });

        this.particleAttributes.forEach(function (a)
        {
            vao.addAttribute(particleBuffer, a.attribute, a.type, a.normalized, particleStrideSize, a.offset * vertSize);
        });
        vao.bind();
        this.particleAttributes.forEach(function (a)
        {
            instanceExt.vertexAttribDivisorANGLE(a.attribute.location, 1);
        });

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

        const samplerLocation = renderer.bindTexture(texture);

        this.shader.uniforms.uSampler = samplerLocation;

        const statusList = particle.statusList;

        if (statusList)
        {
            let location = 1;

            particle.useStatus.forEach(function (statusIndex)
            {
                const texture = statusList[statusIndex].renderTargetOut.texture;

                ShaderParticle.bindTargetTexture(renderer, texture, location);
                shader.uniforms['uStatusOut' + statusIndex] = location;
                location++;
            });
        }

        const pos = shader.uniforms.uPosition;

        if (pos)
        {
            pos[0] = particle.position.x;
            pos[1] = particle.position.y;
            shader.uniforms.uPosition = pos;
        }

        shader.uniforms.uAlpha = particle.alpha;
        shader.uniforms.uColorMultiplier = particle.colorMultiplier;
        shader.uniforms.uColorOffset = particle.colorOffset;

        this.updateShaderCommonUniforms(renderer, particle);
        this.updateShader(renderer, particle);
    }

    /**
     * Destroys the ShaderParticleDisplay.
     *
     */
    destroy()
    {
        super.destroy();
        // TODO
    }
}
