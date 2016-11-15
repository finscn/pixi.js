import * as core from '../../../../core';
import { DRAW_MODES } from '../../../../core/const';
import Light from '../light/Light';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

const Shader = core.Shader;
// const Circle = core.Graphics.Circle;

export default class PointLight extends Light
{
    constructor(color, brightness, radius)
    {
        radius = radius || Infinity;

        if (radius !== Infinity) {
            // const shape = new Circle(0, 0, radius);
            const mesh = PointLight.getCircleMesh(radius, 36);

            super(color, brightness, mesh.vertices, mesh.indices);

            this.useViewportQuad = false;
            this.drawMode = DRAW_MODES.TRIANGLE_FAN;
        } else {
            super(color, brightness);
        }

        this.radius = radius;
        this.shaderName = 'pointLightShader';
    }

    initShader(gl)
    {
        const vertexSrc = glslify('../light/light.vert');
        const fragmentSrc = glslify('./point.frag');
        this.shader = new Shader(gl, vertexSrc, fragmentSrc);
    }

    syncShader()
    {
        const shader = this.shader;
        super.syncShader(shader);

        shader.uniforms.uLightRadius = this.radius;
    }

    static getCircleMesh(radius, totalSegments, vertices, indices)
    {
        totalSegments = totalSegments || 40;

        vertices = vertices || new Float32Array((totalSegments + 1) * 2);
        indices = indices || new Uint16Array(totalSegments + 1);

        const seg = (Math.PI * 2) / totalSegments;
        let indicesIndex = -1;

        indices[++indicesIndex] = indicesIndex;

        for (let i = 0; i <= totalSegments; ++i)
        {
            const index = i * 2;
            const angle = seg * i;

            vertices[index] = Math.cos(angle) * radius;
            vertices[index + 1] = Math.sin(angle) * radius;

            indices[++indicesIndex] = indicesIndex;
        }

        indices[indicesIndex] = 1;

        return {
            vertices: vertices,
            indices: indices,
        };
    }
}
