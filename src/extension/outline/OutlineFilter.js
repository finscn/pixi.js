import * as core from '../../core';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

/**
 * OutlineFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 * http://codepen.io/mishaa/pen/emGNRB
 */
export default class OutlineFilter extends core.Filter
{

    /**
     * @param {number} thickness - The tickness of the outline. Make it 2 times more for resolution 2.
     * @param {number} color - The color of the glow.
     * @example
     *  someSprite.shader = new OutlineFilter(9, 0xFF0000);
     */
    constructor(thickness, color)
    {
        thickness = thickness || 1;
        super(
            // vertex shader
            glslify('./outline.vert'),
            // fragment shader
            glslify('./outline.frag').replace(/%THICKNESS%/gi, (1.0 / thickness).toFixed(7))
        );

        this.uniforms.thickness = thickness;
        this.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]);
        if (color) {
            this.color = color;
        }
    }

    get color()
    {
        return core.utils.rgb2hex(this.uniforms.outlineColor);
    }

    set color(value)
    {
        core.utils.hex2rgb(value, this.uniforms.outlineColor);
    }
}
