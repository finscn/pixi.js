import * as core from '../../core';

const RenderTexture = core.RenderTexture;

export default class LightSpriteFilter extends core.Filter
{

    apply(filterManager, input, output, clear, currentState) {

        const sprite = currentState.target;

        const renderer = filterManager.renderer;
        const lights = sprite.lights;
        const lightCount = lights.length;

        if (!this.normalsRenderTexture) {
            this.normalsRenderTexture = RenderTexture.create(renderer.width, renderer.height);
        }

        const normalsSprite = sprite.normalsTexture;
        normalsSprite.vertexData = sprite.vertexData;
        normalsSprite.worldTransform = sprite.worldTransform;
        normalsSprite.origWidth = sprite.origRealWidth;
        normalsSprite.origHeight = sprite.origRealHeight;
        normalsSprite._anchor = sprite._anchor;

        normalsSprite._renderWebGL = sprite._renderWebGL;

        renderer.render(normalsSprite, this.normalsRenderTexture, true);

        const renderTarget = filterManager.getRenderTarget(true);
        let flip = input;
        let flop = renderTarget;
        let i = 0;
        for (; i < lightCount - 1; i++) {
            const light = lights[i];
            light.init(renderer);

            this.applyLight(renderer, light, sprite, flip, flop, true);

            const temp = flop;
            flop = flip;
            flip = temp;
        }

        const light = lights[i];
        light.init(renderer);

        this.applyLight(renderer, light, sprite, flip, output, clear);

        filterManager.returnRenderTarget(renderTarget);
    }

    applyLight(renderer, light, sprite, input, output, clear)
    {

        const gl = renderer.gl;
        const shader = light.shader;

        this.quad.initVao(shader);

        renderer.bindVao(this.quad.vao);

        renderer.bindRenderTarget(output);

        if (clear)
        {
            gl.disable(gl.SCISSOR_TEST);
            renderer.clear();// [1, 1, 1, 1]);
            gl.enable(gl.SCISSOR_TEST);
        }

        // in case the render target is being masked using a scissor rect
        if (output === renderer.maskManager.scissorRenderTarget)
        {
            renderer.maskManager.pushScissorMask(null, renderer.maskManager.scissorData);
        }

        renderer.bindShader(shader);

        // this syncs the pixi filters  uniforms with glsl uniforms
        // this.syncUniforms(shader, filter);
        light.syncShader();

        shader.uniforms.uSampler = renderer.bindTexture(input.texture);
        shader.uniforms.uNormalSampler = renderer.bindTexture(this.normalsRenderTexture.baseTexture);

        renderer.state.setBlendMode(light.blendMode);

        // renderer.state.setBlendMode(filter.blendMode);

        // temporary bypass cache..
        const tex = this.renderer.boundTextures[0];

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, input.texture.texture);

        // light.quad.vao.draw(renderer.drawModes[light.drawMode], 6, 0);
        this.quad.vao.draw(renderer.drawModes[light.drawMode], 6, 0);

        // restore cache.
        gl.bindTexture(gl.TEXTURE_2D, tex._glTextures[this.renderer.CONTEXT_UID].texture);

    }
}
