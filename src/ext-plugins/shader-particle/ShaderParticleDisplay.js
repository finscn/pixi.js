import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';
import ShaderParticle from './ShaderParticle';
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
        this.uniforms = null;

        this.fboWidth = fboWidth || 0;
        this.fboHeight = fboHeight || 0;
    }

    init(gl, particle)
    {
        this.fboWidth = this.fboWidth || particle.fboWidth;
        this.fboHeight = this.fboHeight || particle.fboHeight;
        this.uniforms = this.uniforms || particle.displayUniforms;

        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);

        this.vertCount = 4;
        this.vertSize = 4;

        this.initVao(gl, particle);
    }

    // name size unsignedByte data share
    initAttributes(gl, particle)
    {
        this.vertexAttributes = [];
        this.vertexOffset = 0;
        this.vertexStride = 0;

        this.particleAttributes = [];
        this.particleOffset = 0;
        this.particleStride = 0;

        this.addParticleAttribute(gl, {
            name: 'aParticleIndex',
            size: 2,
            unsignedByte: false,
        });

        const custom = {};

        if (particle.attributes)
        {
            for (let i = 0; i < particle.attributes.length; i++)
            {
                const info = particle.attributes[i];

                if (info.share)
                {
                    this.addVertexAttribute(gl, info);
                }
                else
                {
                    this.addParticleAttribute(gl, info);
                }
                custom[info.name] = true;
            }
        }

        if (!custom['aVertexPosition'])
        {
            this.addVertexAttribute(gl, {
                name: 'aVertexPosition',
                unsignedByte: false,
                data: particle.vertexData,
            });
        }

        if (!custom['aTextureCoord'])
        {
            this.addVertexAttribute(gl, {
                name: 'aTextureCoord',
                unsignedByte: false,
                data: particle.uvsData,
            });
        }
    }

    addVertexAttribute(gl, info)
    {
        const a = this.shader.attributes[info.name];

        if (!a)
        {
            return;
        }

        const attr = {
            name: info.name,
            unsignedByte: info.unsignedByte,
            data: info.data,
            size: info.size || a.size,

            attribute: a,
            type: info.unsignedByte ? gl.UNSIGNED_BYTE : gl.FLOAT,
            normalized: !!info.unsignedByte,
            offset: this.vertexOffset,
            _dataIndex: 0,
        };

        this.vertexOffset += attr.size;
        this.vertexStride += attr.size;
        this.vertexAttributes.push(attr);
    }

    initVertexBuffer(gl, particle) // eslint-disable-line no-unused-vars
    {
        const vertCount = this.vertCount;

        this.vertexBufferData = new ArrayBuffer(vertCount * this.vertexStride * this.vertSize);
        this.vertexViewFloat32 = new Float32Array(this.vertexBufferData);
        this.vertexViewUint32 = new Uint32Array(this.vertexBufferData);

        const viewFloat32 = this.vertexViewFloat32;
        const viewUint32 = this.vertexViewUint32;
        const attrCount = this.vertexAttributes.length;

        let offset = 0;

        for (let i = 0; i < vertCount; i++)
        {
            for (let j = 0; j < attrCount; j++)
            {
                const attr = this.vertexAttributes[j];
                const view = attr.unsignedByte ? viewUint32 : viewFloat32;

                for (let m = 0; m < attr.size; m++)
                {
                    view[offset++] = attr.data[attr._dataIndex++];
                }
            }
        }
    }

    initParticleBuffer(gl, particle)
    {
        const particleCount = particle.count;

        this.particleBufferData = new ArrayBuffer(particleCount * this.particleStride * this.vertSize);
        this.particleViewFloat32 = new Float32Array(this.particleBufferData);
        this.particleViewUint32 = new Uint32Array(this.particleBufferData);

        const viewFloat32 = this.particleViewFloat32;
        const viewUint32 = this.particleViewUint32;
        const attrCount = this.particleAttributes.length;

        const fboWidth = this.fboWidth;
        const fboHeight = this.fboHeight;
        let col = 0;
        let row = 0;
        let offset = 0;

        for (let i = 0; i < particleCount; i++)
        {
            viewFloat32[offset++] = col / fboWidth;
            viewFloat32[offset++] = row / fboHeight;
            col++;
            if (col >= fboWidth)
            {
                col = 0;
                row++;
            }

            for (let j = 1; j < attrCount; j++)
            {
                const attr = this.particleAttributes[j];
                const view = attr.unsignedByte ? viewUint32 : viewFloat32;

                for (let m = 0; m < attr.size; m++)
                {
                    view[offset++] = attr.data[attr._dataIndex++];
                }
            }
        }
    }

    addParticleAttribute(gl, info)
    {
        const a = this.shader.attributes[info.name];

        if (!a)
        {
            return;
        }

        const attr = {
            name: info.name,
            unsignedByte: info.unsignedByte,
            data: info.data,
            size: info.size || a.size,

            attribute: a,
            type: info.unsignedByte ? gl.UNSIGNED_BYTE : gl.FLOAT,
            normalized: !!info.unsignedByte,
            offset: this.particleOffset,
            _dataIndex: 0,
        };

        this.particleOffset += attr.size;
        this.particleStride += attr.size;
        this.particleAttributes.push(attr);
    }

    initVao(gl, particle)
    {
        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        this.indexBufferData = new Uint16Array([0, 1, 2, 0, 3, 2]);

        this.initAttributes(gl, particle);
        this.initVertexBuffer(gl, particle);
        this.initParticleBuffer(gl, particle);

        this.createVao(gl);
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
                shader.uniforms['statusOut' + statusIndex] = location;
                location++;
            });
        }

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

        if (this.withFrameOffset)
        {
            shader.uniforms.uParticleFrameSize = particle.frameSize;
        }

        for (const key in this.uniforms)
        {
            shader.uniforms[key] = this.uniforms[key];
        }

        this.updateShader(renderer, particle);
    }

    updateShader(renderer, particle)  // eslint-disable-line no-unused-vars
    {
        // ==========================================
        //
        //
        //
        //

        // bind input textures;
        // particle.statusList[0].renderTargetOut.texture.bind(1);
        // this.shader.uniforms.tex1 = 1;
        // particle.statusList[1].renderTargetOut.texture.bind(2);
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

    /**
     * Destroys the ShaderParticleDisplay.
     *
     */
    destroy()
    {
        this.shader.destroy();
        this.vao.destroy();

        this.shader = null;
        this.vao = null;

        this.instanceExt = null;
        this.indexBufferData = null;
        this.vertexBufferData = null;
        this.particleBufferData = null;
    }
}
