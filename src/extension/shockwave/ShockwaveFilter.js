import * as core from '../../core';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef


export default class ShockwaveFilter extends core.Filter
{
    constructor()
    {

        const vertSrc = glslify('../../filters/fragments/default.vert');
        const fragSrc = glslify('./shockwave.frag');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.center = new Float32Array([0.5, 0.5]);
        this.params = new Float32Array([10, 0.8, 0.1]);
        this.time = 0;
    }

    apply(filterManager, input, output, clear)
    {
        this.uniforms.center = this.center;
        this.uniforms.params = this.params;
        this.uniforms.time = this.time;

        filterManager.applyFilter(this, input, output, clear);
    }
}
