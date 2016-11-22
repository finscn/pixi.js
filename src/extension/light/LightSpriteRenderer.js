import * as core from '../../core';

const RenderTexture = core.RenderTexture;
const WebGLRenderer = core.WebGLRenderer;
const Sprite = core.Sprite;

// const tempArray = new Float32Array(4);

export default class LightSpriteRenderer extends core.ObjectRenderer
{
    constructor(renderer)
    {
        super(renderer);
        this.gl = renderer.gl;

        this.middleRenderTexture = RenderTexture.create(renderer.width, renderer.height);
        this.middleSprite = new Sprite(this.middleRenderTexture);
        this.diffuseRenderTexture = RenderTexture.create(2, 2);
        this.normalsRenderTexture = RenderTexture.create(2, 2);
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
        const gl = renderer.gl;

        let width = sprite.diffuseTexture.width;
        let height = sprite.diffuseTexture.height;

        if (sprite.diffuseTexture) {
            this.diffuseRenderTexture.resize(width, height);
            renderer.render(sprite.diffuseTexture, this.diffuseRenderTexture, true);
        } else {
            // TODO
        }

        if (sprite.normalsTexture) {
            width = sprite.normalsTexture.width;
            height = sprite.normalsTexture.height;
            this.normalsRenderTexture.resize(width, height);
            renderer.render(sprite.normalsTexture, this.normalsRenderTexture, true);
        } else {
            // TODO
        }

        const lightCount = sprite.lights.length;

        if (lightCount > 1) {
            renderer.bindRenderTexture(this.middleRenderTexture);
            gl.disable(gl.SCISSOR_TEST);
            renderer.clear(); // [1, 1, 1, 1]);
            gl.enable(gl.SCISSOR_TEST);
        } else {
            renderer.bindRenderTarget(renderer.rootRenderTarget);
        }

        // sprite._renderWebGL = sprite._renderWebGLBakLightSpriteRenderer;
        // renderer.render(sprite);
        // sprite._renderWebGL = LightSpriteRenderer.__renderWebGLSprite;

        const vertexData = sprite.computedGeometry ? sprite.computedGeometry.vertices : sprite.vertexData;
        const uvsData = sprite._texture._uvs;

        const diffuseBaseTexture = this.diffuseRenderTexture.baseTexture;
        const normalsBaseTexture = this.normalsRenderTexture.baseTexture;

        const lights = sprite.lights;

        for (let i = 0; i < lights.length; i++)
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
            quad.upload();


            renderer.bindShader(shader);
            renderer.bindVao(quad.vao);

            light.syncShader();

            shader.uniforms.uSampler = renderer.bindTexture(diffuseBaseTexture);
            shader.uniforms.uNormalSampler = renderer.bindTexture(normalsBaseTexture);

            renderer.state.setBlendMode(light.blendMode);

            light.quad.vao.draw(renderer.drawModes[light.drawMode], 6, 0);

            renderer.drawCount++;
        }

        if (lightCount > 1) {
            renderer.bindRenderTarget(renderer.rootRenderTarget);
            renderer.render(this.middleSprite, null, false);
            renderer.drawCount++;
        }

        this.contextChanged = false;
    }

    destroy()
    {
        super.destroy();
        this.diffuseRenderTexture.destroy();
        this.normalsRenderTexture.destroy();
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

