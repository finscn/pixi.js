import * as core from '../../core';

import vertex from './kawase-blur.vert.js';
import fragment from './kawase-blur.frag.js';

export default class KawaseBlurFilter extends core.Filter
{
    constructor(kernels = [0], pixelSize = 1.0)
    {
        super(
            vertex,
            fragment
        );

        this.kernels = kernels;

        let pixelSizeX;
        let pixelSizeY;

        if (typeof pixelSize === 'number')
        {
            pixelSizeX = pixelSize;
            pixelSizeY = pixelSize;
        }
        else if (pixelSize instanceof core.Point)
        {
            pixelSizeX = pixelSize.x;
            pixelSizeY = pixelSize.y;
        }
        else if (Array.isArray(pixelSize))
        {
            pixelSizeX = pixelSize[0];
            pixelSizeY = pixelSize[1];
        }

        this.pixelSize = new core.Point(pixelSizeX, pixelSizeY);

        this.uniforms.pixelSize = new Float32Array(2);
    }

    apply(filterManager, input, output, clear)
    {
        // 1.0 / filterArea_Size
        this.uniforms.pixelSize[0] = this.pixelSize.x / input.size.width;
        this.uniforms.pixelSize[1] = this.pixelSize.y / input.size.height;

        const renderTarget = filterManager.getRenderTarget(true);

        let source = input;
        let target = renderTarget;
        let tmp;

        const last = this.kernels.length - 1;

        for (let i = 0; i < last; i++)
        {
            const k = this.kernels[i];

            this.uniforms.offset = k;
            filterManager.applyFilter(this, source, target, false);

            tmp = source;
            source = target;
            target = tmp;
        }
        this.uniforms.offset = this.kernels[last];
        filterManager.applyFilter(this, source, output, clear);

        filterManager.returnRenderTarget(renderTarget);
    }
}
