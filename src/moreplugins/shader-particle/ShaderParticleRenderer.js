import * as core from '../../core';
// import settings from '../../core/settings';
// import bitTwiddle from 'bit-twiddle';

const ObjectRenderer = core.ObjectRenderer;
const WebGLRenderer = core.WebGLRenderer;
const BLEND_MODES = core.BLEND_MODES;

export default class ShaderParticleRenderer extends ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);

        this.blendMode = BLEND_MODES.NORMAL;
        this.renderer.on('prerender', this.onPrerender, this);
    }

    onContextChange()
    {
        this.gl = this.renderer.gl;
        const gl = this.gl;

        this.instanceExt = gl.getExtension('ANGLE_instanced_arrays')
             || gl.getExtension('MOZ_ANGLE_instanced_arrays')
             || gl.getExtension('WEBKIT_ANGLE_instanced_arrays');
    }

    /**
     * Called before the renderer starts rendering.
     *
     */
    onPrerender()
    {
        //
    }

    /**
     * Renders the point object.
     *
     * @param {ShaderParticleGroup} particleGroup - the point to render when using this pointbatch
     */
    render(particleGroup)
    {
        if (particleGroup.disabled)
        {
            return;
        }

        const renderer = this.renderer;
        const gl = this.gl;
        const instanceExt = this.instanceExt;

        const display = particleGroup.display;
        const particleCount = particleGroup.particleCount;

        // re-enable blending so our bunnies look good
        renderer.state.setBlendMode(particleGroup.blendMode);

        display.update(renderer, particleGroup);

        // boom! draw some bunnies
        if (display.useInstanced)
        {
            instanceExt.drawElementsInstancedANGLE(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, particleCount);
        }
        else
        {
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }
    }

    /**
     * Destroys the ShaderParticleRenderer.
     *
     */
    destroy()
    {
        super.destroy();

        this.blendMode = null;
        this.instanceExt = null;
        this.gl = null;
    }
}

WebGLRenderer.registerPlugin('shaderparticle', ShaderParticleRenderer);
