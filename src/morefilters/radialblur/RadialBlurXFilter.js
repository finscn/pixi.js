import * as core from '../../core';
import generateRadialBlurVertSource from './generateRadialBlurVertSource';
import generateRadialBlurFragSource from './generateRadialBlurFragSource';
import getMaxBlurKernelSize from '../../filters/blur/getMaxBlurKernelSize';

export default class RadialBlurXFilter extends core.Filter
{

    constructor(strength, quality, resolution, kernelSize, horizontal)
    {
        kernelSize = kernelSize || 5;

        horizontal = horizontal !== false;

        const vertSrc = generateRadialBlurVertSource(kernelSize, horizontal);
        const fragSrc = generateRadialBlurFragSource(kernelSize, horizontal);

        // core.utils.log(' ==== RadialBlur Filter : ' + horizontal + ' ==== ');
        // core.utils.log(fragSrc);

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.horizontal = horizontal;

        this._center = [0, 0];
        this._uCenterCoord = new Float32Array(2);
        this._minRadius = 0;
        this._uMinRadius = 0;

        this.resolution = resolution || 1;

        this._quality = 0;

        this.quality = quality || 4;
        this.strength = strength || 8;

        this.firstRun = true;
    }

    apply(filterManager, input, output, clear)
    {
        if (this.firstRun)
        {
            const gl = filterManager.renderer.gl;
            const kernelSize = getMaxBlurKernelSize(gl);

            this.vertexSrc = generateRadialBlurVertSource(kernelSize, this.horizontal);
            this.fragmentSrc = generateRadialBlurFragSource(kernelSize, this.horizontal);

            this.firstRun = false;
        }

        const inWidth = input.size.width;
        const inHeight = input.size.height;

        const aspect = inWidth / inHeight;

        this.uniforms.aspect = aspect;

        this._uCenterCoord[0] = (this._center[0] + this.padding) / inWidth;
        // this._uCenterCoord[1] = this._center[1] / inHeight / aspect;
        this._uCenterCoord[1] = (this._center[1] + this.padding) / inWidth;
        this.uniforms.centerCoord = this._uCenterCoord;

        // const uMinRadius = this._minRadius / inWidth * aspect;
        const uMinRadius = this._minRadius / inHeight;

        this.uniforms.minRadius = uMinRadius;

        this.uniforms.strength = this.horizontal ? (1 / inWidth) : (1 / inHeight);

        // screen space!
        this.uniforms.strength *= this.strength;
        this.uniforms.strength /= this.passes;// / this.passes//Math.pow(1, this.passes);

        if (this.passes === 1)
        {
            filterManager.applyFilter(this, input, output, clear);
        }
        else
        {
            const renderTarget = filterManager.getRenderTarget(true);
            let flip = input;
            let flop = renderTarget;

            for (let i = 0; i < this.passes - 1; i++)
            {
                filterManager.applyFilter(this, flip, flop, true);

                const temp = flop;

                flop = flip;
                flip = temp;
            }

            filterManager.applyFilter(this, flip, output, clear);

            filterManager.returnRenderTarget(renderTarget);
        }
    }

    setCenter(x, y)
    {
        this._center[0] = x;
        this._center[1] = y;
    }

    getCenter()
    {
        return this._center;
    }

    get minRadius()
    {
        return this._minRadius;
    }

    set minRadius(value)
    {
        this._minRadius = value;
    }

    get blur()
    {
        return this.strength;
    }

    set blur(value)
    {
        this.padding = Math.abs(value) * 2;
        this.strength = value;
    }

    get quality()
    {
        return this._quality;
    }

    set quality(value)
    {
        this._quality = value;
        this.passes = value;
    }
}
