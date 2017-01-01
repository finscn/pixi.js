import * as core from '../../../core';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

export default class TrailFilter extends core.Filter
{
    constructor()
    {
        const vertSrc = glslify('../../../filters/fragments/default.vert');
        const fragSrc = glslify('./trail.frag');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.time = 0;
        this.uniforms.uFrameSize = new Float32Array([0, 0]);
        this.uniforms.uViewSize = new Float32Array([0, 0]);
        this.uniforms.uStartPos = new Float32Array([0, 0]);
        this.uniforms.uPos = new Float32Array([0, 0]);
    }

    apply(filterManager, input, output, clear)
    {
        if (!this.viewSize)
        {
            this.viewSize = new Float32Array([
                filterManager.renderer.width,
                filterManager.renderer.height,
            ]);
        }
        this.uniforms.uViewSize[0] = this.viewSize[0];
        this.uniforms.uViewSize[1] = this.viewSize[1];
        this.uniforms.uFrameSize[0] = input.size.width;
        this.uniforms.uFrameSize[1] = input.size.height;
        this.uniforms.uTime = this.time;

        filterManager.applyFilter(this, input, output, clear);
    }
}
