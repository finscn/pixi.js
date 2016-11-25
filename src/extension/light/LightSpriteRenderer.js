import * as core from '../../core';

const WebGLRenderer = core.WebGLRenderer;
// const RenderTexture = core.RenderTexture;

export default class LightSpriteRenderer extends core.ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);
        this.gl = renderer.gl;
    }

    onContextChange()
    {
        this.contextChanged = true;
    }

    render(sprite)
    {
        if (!sprite.texture._uvs || !sprite.lights) {
            return;
        }

        const renderer = this.renderer;
        // const gl = renderer.gl;

        const lights = sprite.lights;
        const lightCount = lights.length;

        const vertexData = sprite.computedGeometry ? sprite.computedGeometry.vertices : sprite.vertexData;
        const uvsData = sprite.diffuseTexture._uvs;
        const uvsDataNormal = sprite.normalTexture._uvs;
        const uSamplerLocation = renderer.bindTexture(sprite.diffuseTexture);
        let uNormalSamplerLocation;
        if (sprite.diffuseTexture.baseTexture === sprite.normalTexture.baseTexture) {
            uNormalSamplerLocation = uSamplerLocation;
        } else {
            uNormalSamplerLocation = renderer.bindTexture(sprite.normalTexture);
        }

        for (let i = 0; i < lightCount; i++)
        {
            const light = lights[i];
            light.init(renderer, this.contextChanged);

            const shader = light.shader;
            const quad = light.quad;

            const vertices = quad.vertices;
            const uvs = quad.uvs;

            for (let i = 0; i < 8; i++) {
                vertices[i] = vertexData[i];
            }

            uvs[0] = uvsData.x0;
            uvs[1] = uvsData.y0;
            uvs[2] = uvsData.x1;
            uvs[3] = uvsData.y1;
            uvs[4] = uvsData.x2;
            uvs[5] = uvsData.y2;
            uvs[6] = uvsData.x3;
            uvs[7] = uvsData.y3;
            uvs[8] = uvsDataNormal.x0;
            uvs[9] = uvsDataNormal.y0;
            uvs[10] = uvsDataNormal.x1;
            uvs[11] = uvsDataNormal.y1;
            uvs[12] = uvsDataNormal.x2;
            uvs[13] = uvsDataNormal.y2;
            uvs[14] = uvsDataNormal.x3;
            uvs[15] = uvsDataNormal.y3;
            quad.upload();

            renderer.bindShader(shader);
            renderer.bindVao(quad.vao);

            shader.uniforms.uSampler = uSamplerLocation;
            shader.uniforms.uNormalSampler = uNormalSamplerLocation;

            light.syncShader(sprite);

            renderer.state.setBlendMode(light.blendMode);

            light.quad.vao.draw(renderer.drawModes[light.drawMode], 6, 0);

            renderer.drawCount++;
        }

        this.contextChanged = false;
    }

    destroy()
    {
        super.destroy();
        // TODO
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

