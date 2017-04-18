import * as core from '../../core';
import settings from '../../core/settings';
import glCore from 'pixi-gl-core';
import bitTwiddle from 'bit-twiddle';
import PointRenderer from './PointRenderer';

const WebGLRenderer = core.WebGLRenderer;

export default class PointGroupRenderer extends PointRenderer
{

    initSize()
    {
        /**
         * Number of values sent in the vertex buffer.
         * positionX, positionY, size, colorR, colorG, colorB, colorA = 7
         *
         * @member {number}
         */
        this.vertSize = 4;

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
                .addAttribute(this.vertexBuffers[i], shader.attributes.aSize, gl.FLOAT, true, this.vertByteSize, 2 * 4)
                .addAttribute(this.vertexBuffers[i], shader.attributes.aAlpha, gl.FLOAT, true, this.vertByteSize, 3 * 4);

            /* eslint-disable max-len */
        }

        this.vao = this.vaos[0];
        this.currentBlendMode = 99999;
    }

    /**
     * Renders the point object.
     *
     * @param {DisplayPointGroup} pointGroup - the point group to render when using this pointbatch
     */
    render(pointGroup)
    {
        this.currentGroup = pointGroup;
        this._ax = pointGroup._ax;
        this._ay = pointGroup._ay;

        this.shader.uniforms.uColor = pointGroup.color;
        this.shader.uniforms.uRounded = pointGroup._roundedInt;

        this.renderer.bindShader(this.shader);
        this.renderer.state.setBlendMode(this.blendMode);

        const points = pointGroup.points;
        const count = points.length;
        let i = 0;

        while (i < count)
        {
            const point = points[i];

            if (point.disabled)
            {
                // count--;
                // points.splice(i, 1);
                i++;
                continue;
            }

            this.points[this.currentIndex++] = point;
            if (this.currentIndex >= this.size)
            {
                this.flush();
            }
            i++;
        }
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

        const points = this.points;
        const vertSize = this.vertSize;
        let index = 0;
        let i;

        for (i = 0; i < this.currentIndex; ++i)
        {
            const point = points[i];

            float32View[index] = point.x + this._ax;
            float32View[index + 1] = point.y + this._ay;
            float32View[index + 2] = point.size;
            float32View[index + 3] = point.alpha;

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
                    .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aSize, gl.FLOAT, true, this.vertByteSize, 2 * 4)
                    .addAttribute(this.vertexBuffers[this.vertexCount], shader.attributes.aAlpha, gl.FLOAT, true, this.vertByteSize, 3 * 4);

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

        gl.drawArrays(gl.POINTS, 0, this.currentIndex);

        // reset elements for the next flush
        this.currentIndex = 0;
    }

    stop()
    {
        // empty
    }

    getVertexSrc()
    {
        return [
            'uniform mat3 projectionMatrix;',
            'attribute vec2 aVertexPosition;',
            'attribute float aSize;',
            'attribute float aAlpha;',
            'uniform vec3 uColor;',
            'varying vec4 vColor;',
            'void main() {',
            '  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',
            '  gl_PointSize = aSize;',
            '  vColor = vec4(uColor * aAlpha , aAlpha);',
            '}',
        ].join('\n');
    }

    getFragmentSrc()
    {
        return [
            'precision mediump float;',
            'varying vec4 vColor;',
            'uniform float uRounded;',
            'void main() {',
            '  if(uRounded == 1.0 && distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {',
            '    discard;',
            '  }',
            '  gl_FragColor = vColor;',
            '}',
        ].join('\n');
    }
}

WebGLRenderer.registerPlugin('pointGroup', PointGroupRenderer);

