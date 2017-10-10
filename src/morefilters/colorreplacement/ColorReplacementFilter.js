import * as core from '../../core';
import vertex from './color-replacement.vert.js';
import fragment from './color-replacement.frag.js';

export default class ColorReplacementFilter extends core.Filter
{
    constructor(sourceColors, targetColors, range)
    {
        const colorCount = Math.min(sourceColors.length, targetColors.length);

        super(
            vertex,
            fragment.replace(/%colorCount%/g, colorCount)
        );

        this.range = range || range === 0 ? range : 0.075;
        this.colorCount = colorCount;

        const size = colorCount * 3;

        this.sourceColors = new Float32Array(size);
        this.targetColors = new Float32Array(size);

        for (let i = 0; i < colorCount; ++i)
        {
            const s = core.utils.hex2rgb(sourceColors[i]);
            const t = core.utils.hex2rgb(targetColors[i]);

            this.sourceColors[i * 3] = s[0];
            this.sourceColors[(i * 3) + 1] = s[1];
            this.sourceColors[(i * 3) + 2] = s[2];

            this.targetColors[i * 3] = t[0];
            this.targetColors[(i * 3) + 1] = t[1];
            this.targetColors[(i * 3) + 2] = t[2];
        }
    }

    apply(filterManager, input, output, clear)
    {
        this.uniforms.range = this.range;
        this.uniforms.sourceColors = this.sourceColors;
        this.uniforms.targetColors = this.targetColors;

        filterManager.applyFilter(this, input, output, clear);
    }
}
