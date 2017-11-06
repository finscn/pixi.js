import * as core from '../../core';
import Buffer from '../../core/sprites/webgl/BatchBuffer';
import settings from '../../core/settings';
import glCore from 'pixi-gl-core';
import bitTwiddle from 'bit-twiddle';

const ObjectRenderer = core.ObjectRenderer;
const WebGLRenderer = core.WebGLRenderer;
const Shader = core.Shader;
const BLEND_MODES = core.BLEND_MODES;

export default class PointRenderer extends ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);

        this.initSize();

        /**
         * The number of images in the PointRenderer before it flushes.
         *
         * @member {number}
         */
        this.size = settings.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

        // the total number of bytes in our batch
        // let numVerts = this.size * 4 * this.vertByteSize;

        this.buffers = [];
        for (let i = 1; i <= bitTwiddle.nextPow2(this.size); i *= 2)
        {
            this.buffers.push(new Buffer(i * 4 * this.vertByteSize));
        }

        const totalIndices = this.size;
        const indices = this.indices = new Uint16Array(totalIndices);

        for (let i = 0, j = 0; i < totalIndices; i += 1, j += 4)
        {
            indices[i + 0] = j + 0;
        }

        this.shader = null;

        this.points = [];
        this.vertexBuffers = [];
        this.vaos = [];

        this.currentIndex = 0;
        this.vaoMax = 2;
        this.vertexCount = 0;

        this.blendMode = BLEND_MODES.NORMAL;
        this.renderer.on('prerender', this.onPrerender, this);
    }

    initSize()
    {
        /**
         * Number of values sent in the vertex buffer.
         * positionX, positionY, size, colorR, colorG, colorB, colorA = 7
         *
         * @member {number}
         */
        this.vertSize = 7;

        /**
         * The size of the vertex information in bytes.
         *
         * @member {number}
         */
        this.vertByteSize = this.vertSize * 4;
    }

    onContextChange()
    {
        const gl = this.renderer.gl;
        const shader = this.shader = this.generateShader(gl);

        // create a couple of buffers
        this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

        this.renderer.bindVao(null);

        for (let i = 0; i < this.vaoMax; i++)
        {
            this.vertexBuffers[i] = glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);

            /* eslint-disable max-len */

            // build the vao object that will render..
            this.vaos[i] = this.renderer.createVao()
                .addIndex(this.indexBuffer)
                .addAttribute(this.vertexBuffers[i], shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
                .addAttribute(this.vertexBuffers[i], shader.attributes.aSize, gl.FLOAT, false, this.vertByteSize, 2 * 4)
                .addAttribute(this.vertexBuffers[i], shader.attributes.aColor, gl.FLOAT, false, this.vertByteSize, 3 * 4)
                .addAttribute(this.vertexBuffers[i], shader.attributes.aAlpha, gl.FLOAT, false, this.vertByteSize, 6 * 4);

            /* eslint-disable max-len */
        }

        this.vao = this.vaos[0];
        this.currentBlendMode = 99999;
    }

    /**
     * Called before the renderer starts rendering.
     *
     */
    onPrerender()
    {
        this.vertexCount = 0;
    }

    generateShader(gl)
    {
        const vertexSrc = this.getVertexSrc();
        const fragmentSrc = this.getFragmentSrc();
        const shader = new Shader(gl, vertexSrc, fragmentSrc);

        return shader;
    }

    /**
     * Renders the point object.
     *
     * @param {DisplayPoint} point - the point to render when using this pointbatch
     */
    render(point)
    {
        if (point.disabled)
        {
            return;
        }

        if (this.currentIndex >= this.size)
        {
            this.flush();
        }

        this.points[this.currentIndex++] = point;
    }

    /**
     * Renders the content and empties the current batch.
     *
     */
    flush()
    {
        if (this.currentIndex === 0)
        {
            return;
        }

        const renderer = this.renderer;
        const shader = this.shader;
        const gl = renderer.gl;

        const np2 = bitTwiddle.nextPow2(this.currentIndex);
        const log2 = bitTwiddle.log2(np2);
        const buffer = this.buffers[log2];
        const float32View = buffer.float32View;

        renderer.bindShader(this.shader);

        const points = this.points;
        const vertSize = this.vertSize;
        let index = 0;
        let i;

        for (i = 0; i < this.currentIndex; ++i)
        {
            const point = points[i];

            float32View[index] = point.x;
            float32View[index + 1] = point.y;
            float32View[index + 2] = point.size;
            float32View[index + 3] = point.color[0];
            float32View[index + 4] = point.color[1];
            float32View[index + 5] = point.color[2];
            float32View[index + 6] = point.alpha;

            index += vertSize;
        }

        if (!settings.CAN_UPLOAD_SAME_BUFFER)
        {
            // this is still needed for IOS performance..
            // it really does not like uploading to the same buffer in a single frame!
            if (this.vaoMax <= this.vertexCount)
            {
                this.vaoMax++;
                this.vertexBuffers[this.vertexCount] = glCore.GLBuffer.createVertexBuffer(gl, null, gl.STREAM_DRAW);

                /* eslint-disable max-len */

                // build the vao object that will render..
                this.vaos[this.vertexCount] = this.renderer.createVao()
                    .addIndex(this.indexBuffer)
                    .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0)
                    .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aSize, gl.FLOAT, false, this.vertByteSize, 2 * 4)
                    .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aColor, gl.FLOAT, false, this.vertByteSize, 3 * 4)
                    .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aAlpha, gl.FLOAT, false, this.vertByteSize, 6 * 4);

                /* eslint-disable max-len */
            }

            this.renderer.bindVao(this.vaos[this.vertexCount]);

            this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, false);

            this.vertexCount++;
        }
        else
        {
            // lets use the faster option, always use buffer number 0
            this.vertexBuffers[this.vertexCount].upload(buffer.vertices, 0, true);
        }

        renderer.state.setBlendMode(this.blendMode);

        gl.drawArrays(gl.POINTS, 0, this.currentIndex);

        // reset elements for the next flush
        this.currentIndex = 0;
    }

    /**
     * Starts a new point batch.
     */
    start()
    {
        this.renderer.bindShader(this.shader);

        if (settings.CAN_UPLOAD_SAME_BUFFER)
        {
            // bind buffer #0, we don't need others
            this.renderer.bindVao(this.vaos[this.vertexCount]);

            this.vertexBuffers[this.vertexCount].bind();
        }
    }

    /**
     * Stops and flushes the current batch.
     *
     */
    stop()
    {
        this.flush();
    }

    /**
     * Destroys the PointRenderer.
     *
     */
    destroy()
    {
        for (let i = 0; i < this.vaoMax; i++)
        {
            if (this.vertexBuffers[i])
            {
                this.vertexBuffers[i].destroy();
            }
            if (this.vaos[i])
            {
                this.vaos[i].destroy();
            }
        }

        if (this.indexBuffer)
        {
            this.indexBuffer.destroy();
        }

        this.renderer.off('prerender', this.onPrerender, this);

        super.destroy();

        if (this.shader)
        {
            this.shader.destroy();
            this.shader = null;
        }

        this.vertexBuffers = null;
        this.vaos = null;
        this.indexBuffer = null;
        this.indices = null;

        this.points = null;

        for (let i = 0; i < this.buffers.length; ++i)
        {
            this.buffers[i].destroy();
        }
    }

    getVertexSrc()
    {
        return [
            'uniform mat3 projectionMatrix;',
            'attribute vec2 aVertexPosition;',
            'attribute float aSize;',
            'attribute vec3 aColor;',
            'attribute float aAlpha;',
            'varying vec4 vColor;',
            'void main() {',
            '  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '  gl_PointSize = aSize;',
            '  vColor = vec4(aColor.r * aAlpha, aColor.g * aAlpha, aColor.b * aAlpha , aAlpha);',
            '}',
        ].join('\n');
    }

    getFragmentSrc()
    {
        return [
            'precision mediump float;',
            'varying vec4 vColor;',
            'void main() {',
            '    gl_FragColor = vColor;',
            '}',
        ].join('\n');
    }
}

WebGLRenderer.registerPlugin('point', PointRenderer);

