export default class ShaderParticleProcessor
{
    constructor()
    {
        this.shader = null;
        this.vao = null;
        this.attributes = null;
        // nothing to do
    }

    initVao(gl, particle)
    {
        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        this.indexBufferData = new Uint16Array([0, 1, 2, 0, 3, 2]);

        this.initAttributes(gl, particle);
        this.initVertexBufferData(gl, particle);
        this.initParticleBufferData(gl, particle);

        this.createVao(gl);
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

        if (this.attributes)
        {
            for (let i = 0; i < this.attributes.length; i++)
            {
                const info = this.attributes[i];

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
        const attr = this.shader.attributes[info.name];

        if (!attr)
        {
            return;
        }

        const attrInfo = {
            name: info.name,
            unsignedByte: info.unsignedByte,
            data: info.data,
            size: info.size || attr.size,

            attribute: attr,
            type: info.unsignedByte ? gl.UNSIGNED_BYTE : gl.FLOAT,
            normalized: !!info.unsignedByte,
            offset: this.vertexOffset,
            _dataIndex: 0,
        };

        this.vertexOffset += attrInfo.size;
        this.vertexStride += attrInfo.size;
        this.vertexAttributes.push(attrInfo);
    }

    addParticleAttribute(gl, info)
    {
        const attr = this.shader.attributes[info.name];

        if (!attr)
        {
            return;
        }

        const attrInfo = {
            name: info.name,
            unsignedByte: info.unsignedByte,
            data: info.data,
            size: info.size || attr.size,

            attribute: attr,
            type: info.unsignedByte ? gl.UNSIGNED_BYTE : gl.FLOAT,
            normalized: !!info.unsignedByte,
            offset: this.particleOffset,
            _dataIndex: 0,
        };

        this.particleOffset += attrInfo.size;
        this.particleStride += attrInfo.size;
        this.particleAttributes.push(attrInfo);
    }

    initVertexBufferData(gl, particle) // eslint-disable-line no-unused-vars
    {
        const vertCount = this.vertCount;

        this.vertexBufferData = new ArrayBuffer(vertCount * this.vertexStride * this.vertSize);
        const viewFloat32 = new Float32Array(this.vertexBufferData);
        const viewUint32 = new Uint32Array(this.vertexBufferData);

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

    initParticleBufferData(gl, particle) // eslint-disable-line no-unused-vars
    {
        const particleCount = particle.count;

        this.particleBufferData = new ArrayBuffer(particleCount * this.particleStride * this.vertSize);
        const viewFloat32 = new Float32Array(this.particleBufferData);
        const viewUint32 = new Uint32Array(this.particleBufferData);

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

    updateShaderCommonUniforms(renderer, particle)
    {
        const shader = this.shader;

        shader.uniforms.uParticleCount = particle.count;
        if (shader.uniforms.uViewSize)
        {
            this.viewSize[0] = renderer.width;
            this.viewSize[1] = renderer.height;
            shader.uniforms.uViewSize = this.viewSize;
        }

        if (shader.uniforms.uFboSize)
        {
            shader.uniforms.uFboSize = this.fboSize;
        }

        for (const key in this.uniforms)
        {
            shader.uniforms[key] = this.uniforms[key];
        }
    }

    updateShader(renderer, particle) // eslint-disable-line no-unused-vars
    {
        // ==========================================
        //
        //
        //

        // bind input textures;
        // particle.statusList[0].renderTargetOut.texture.bind(1);
        // this.shader.uniforms.uStatusOut0 = 1;
        // particle.statusList[1].renderTargetOut.texture.bind(2);
        // this.shader.uniforms.uStatusOut1 = 2;

        // other params
        // this.shader.uniforms.foo = foo;
        // this.shader.uniforms.bar = bar;

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
