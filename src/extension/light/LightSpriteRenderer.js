import * as core from '../../core';

const RenderTexture = core.RenderTexture;
const WebGLRenderer = core.WebGLRenderer;

// const tempArray = new Float32Array(4);

export default class LightSpriteRenderer extends core.ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);
        this.gl = renderer.gl;

        this.diffuseTexture = RenderTexture.create(2, 2);
        this.normalsTexture = RenderTexture.create(2, 2);
    }

    onContextChange()
    {
        if (this.lights) {
            // TODO
        }
    }

    render(sprite)
    {
        if (!sprite.texture._uvs || !sprite.lights) {
            return;
        }

        const renderer = this.renderer;
        const gl = renderer.gl;

        const width = sprite.texture.width;
        const height = sprite.texture.height;
        this.diffuseTexture.resize(width, height);

        sprite._renderWebGL = sprite._renderWebGLBakLightSpriteRenderer;
        renderer.render(sprite, this.diffuseTexture, true);
        sprite._renderWebGL = LightSpriteRenderer.__renderWebGLSprite;

        if (sprite.normalsTexture) {
            this.normalsTexture.resize(width, height);
            renderer.render(sprite.normalsTexture, this.normalsTexture, true);
        } else {
            // TODO
        }

        const lights = sprite.lights;

        for (let i = 0; i < lights.length; ++i)
        {
            const light = lights[i];
            light.update(gl);

            renderer.state.setBlendMode(light.blendMode);

            if (light.useViewportQuad) {
                // update verts to ensure it is a fullscreen quad even if the renderer is resized. This should be optimized
                light.vertices[2] = light.vertices[4] = renderer.width;
                light.vertices[5] = light.vertices[7] = renderer.height;
            }

            // set uniforms, can do some optimizations here.
            light.shader.uniforms.uViewSize[0] = renderer.width;
            light.shader.uniforms.uViewSize[1] = renderer.height;

            light.shader.uniforms.translationMatrix = light.worldTransform.toArray(true);
            // light.shader.uniforms.projectionMatrix = renderer.currentRenderTarget.projectionMatrix.toArray(true);

            renderer.bindShader(light.shader);

            light.syncShader(sprite);

            // shader.syncUniforms();
            light.shader.uniforms.uSampler = light.diffuseTextureLocation;
            light.shader.uniforms.uNormalSampler = light.normalsTextureLocation;
            // gl.uniform1i(light.shader.uniforms.uSampler._location, 0);
            // gl.uniform1i(light.shader.uniforms.uNormalSampler._location, 1);

            light.render(renderer, this.diffuseTexture, this.normalsTexture);

            gl.drawElements(renderer.drawModes[light.drawMode], light.indices.length, gl.UNSIGNED_SHORT, 0);
            renderer.drawCount++;
        }
    }

    destroy()
    {
        super.destroy();
        this.diffuseTexture.destroy();
        this.normalsTexture.destroy();
    }

    static applyTo(sprite)
    {
        sprite._renderWebGLBakLightSpriteRenderer = sprite._renderWebGL;
        sprite._renderWebGL = LightSpriteRenderer.__renderWebGLSprite;
    }

    static unapplyTo(sprite)
    {
        if (sprite._renderWebGLBakLightSpriteRenderer) {
            sprite._renderWebGL = sprite._renderWebGLBakLightSpriteRenderer;
            sprite._renderWebGLBakLightSpriteRenderer = null;
        }
    }

    static __renderWebGLSprite(renderer)
    {
        const sprite = this;
        // sprite.calculateVerticesWithoutTransform(true);
        sprite.calculateVertices();
        renderer.setObjectRenderer(renderer.plugins.lightsprite);
        renderer.plugins.lightsprite.render(sprite);
    }
}

WebGLRenderer.registerPlugin('lightsprite', LightSpriteRenderer);

