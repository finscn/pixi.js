import glCore from 'pixi-gl-core';
import Shader from '../../core/Shader';

export default class ShaderParticleDisplay
{

    constructor(vertexSrc, fragmentSrc)
    {
        // TODO
        this.id = null;

        this.vertexSrc = vertexSrc;
        this.fragmentSrc = fragmentSrc;
    }

    init(gl, particleGroup)
    {
        this.gl = gl;
        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');

        this.shader = new Shader(gl, this.vertexSrc, this.fragmentSrc);
        this.initVao(particleGroup);
    }

    initVao(particleGroup)
    {
        const gl = this.gl;
        const instanceExt = this.instanceExt;
        const shader = this.shader;
        const fboSize = this.fboSize;

        const indicesData = new Uint16Array([0, 1, 2, 0, 3, 2]);
        const indexBuffer = new glCore.GLBuffer.createIndexBuffer(gl, indicesData, gl.STATIC_DRAW);

        const vertCount = 4;

        // aVertexPosition(2), aTextureCoord(2), aFrame(4)
        const byteCount = 8;
        const vertSize = 4;
        const vertByteSize = byteCount * vertSize;

        const buff = new ArrayBuffer(vertByteSize * vertCount);
        const posView = new Float32Array(buff);
        const coordView = new Float32Array(buff);
        const frameView = new Float32Array(buff);

        const vertexBuffer = new glCore.GLBuffer.createVertexBuffer(gl, buff, gl.STATIC_DRAW);

        const particles = particleGroup.particles;
        const totalCount = particles.length;
        const firstParticle = particles[0];

        const texture = firstParticle._texture;
        const verts = firstParticle.vertexData;
        const frame = texture._frame;

        let offset = 0;

        posView[offset + 0] = verts[0];
        posView[offset + 1] = verts[1];
        coordView[offset + 2] = 0;
        coordView[offset + 3] = 0;
        frameView[offset + 4] = frame.x;
        frameView[offset + 5] = frame.y;
        frameView[offset + 6] = frame.width;
        frameView[offset + 7] = frame.height;

        offset += 8;

        posView[offset + 0] = verts[2];
        posView[offset + 1] = verts[3];
        coordView[offset + 2] = 0;
        coordView[offset + 3] = 1;
        frameView[offset + 4] = frame.x;
        frameView[offset + 5] = frame.y;
        frameView[offset + 6] = frame.width;
        frameView[offset + 7] = frame.height;

        offset += 8;

        posView[offset + 0] = verts[4];
        posView[offset + 1] = verts[5];
        coordView[offset + 2] = 1;
        coordView[offset + 3] = 1;
        frameView[offset + 4] = frame.x;
        frameView[offset + 5] = frame.y;
        frameView[offset + 6] = frame.width;
        frameView[offset + 7] = frame.height;

        offset += 8;

        posView[offset + 0] = verts[6];
        posView[offset + 1] = verts[7];
        coordView[offset + 2] = 1;
        coordView[offset + 3] = 0;
        frameView[offset + 4] = frame.x;
        frameView[offset + 5] = frame.y;
        frameView[offset + 6] = frame.width;
        frameView[offset + 7] = frame.height;

        const spriteIndices = new Float32Array(totalCount * 2);

        let idx = 0;
        let c = 0;
        let r = 0;

        for (let i = 0; i < totalCount; i++)
        {
            spriteIndices[idx + 0] = c / fboSize;
            spriteIndices[idx + 1] = r / fboSize;

            idx += 2;
            c++;
            if (c >= fboSize)
            {
                c = 0;
                r++;
            }
        }
        idx = 0;

        // create some buffers to hold our vertex data
        // the vertex data here does not hold a posiiton of the bunny, but the uv of the pixle in the physics texture
        const quadSpriteIndices = new glCore.GLBuffer.createVertexBuffer(gl, spriteIndices, gl.STATIC_DRAW);

        // create a VertexArrayObject - this will hold all the details for rendering the texture
        const vao = new glCore.VertexArrayObject(gl);
        const attrs = shader.attributes;

        vao.addIndex(indexBuffer);
        vao.addAttribute(vertexBuffer, attrs.aVertexPosition, gl.FLOAT, false, vertByteSize, 0);
        vao.addAttribute(vertexBuffer, attrs.aTextureCoord, gl.FLOAT, false, vertByteSize, 8);
        vao.addAttribute(vertexBuffer, attrs.aFrame, gl.FLOAT, false, vertByteSize, 16);

        vao.addAttribute(quadSpriteIndices, attrs.aIndex);

        vao.bind();
        instanceExt.vertexAttribDivisorANGLE(attrs.aIndex.location, 1);
        // instanceExt.vertexAttribDivisorANGLE(attrs.aFrame.location, 1);

        this.vao = vao;
    }

    update(particleGroup, timeStep, now) // eslint-disable-line no-unused-vars
    {
        // nothing to do
    }

    updateShader(particleGroup)
    {
        const statusList = particleGroup.statusList;

        // ==========================================
        //
        //
        //
        //

        // bind the texture we just rendered in step one.
        statusList[0].fboOut.texture.bind();

        // statusList[1].fboOut.texture.bind(2);

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

    /**
     * Destroys the ShaderParticleDisplay.
     *
     */
    destroy()
    {
        // TODO
    }
}
