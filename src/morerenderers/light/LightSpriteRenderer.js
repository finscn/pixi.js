import * as core from '../../core';
import LightQuad from './LightQuad';
import Light from './lights/light/Light';

const WebGLRenderer = core.WebGLRenderer;
const Texture = core.Texture;
// const RenderTexture = core.RenderTexture;

export default class LightSpriteRenderer extends core.ObjectRenderer
{
    onContextChange()
    {
        this.gl = this.renderer.gl;
        this.quad = new LightQuad(this.gl, this.renderer.state.attribState);
        Light.shaderCache = {};
        this.contextChanged = true;
    }

    render(sprite)
    {
        if (!sprite._texture._uvs || !sprite.lights)
        {
            return;
        }

        const renderer = this.renderer;
        const gl = renderer.gl;

        const lights = sprite.lights;
        const lightCount = lights.length;

        const vertexData = sprite.computedGeometry ? sprite.computedGeometry.vertices : sprite.vertexData;
        const diffuseTexture = sprite.diffuseTexture ? sprite.diffuseTexture : sprite._texture;
        const normalTexture = sprite.normalTexture ? sprite.normalTexture : LightSpriteRenderer.defaultNormalTexture;

        const uWorldMatrix = sprite.worldTransform.toArray(true);

        const uvsData = diffuseTexture._uvs;
        const uvsDataNormal = normalTexture._uvs;

        const uSamplerLocation = renderer.bindTexture(diffuseTexture, 1, true);
        let uNormalSamplerLocation;

        if (diffuseTexture.baseTexture === normalTexture.baseTexture)
        {
            uNormalSamplerLocation = uSamplerLocation;
        }
        else
        {
            uNormalSamplerLocation = renderer.bindTexture(normalTexture, 2, true);
        }

        let lastShader = null;

        for (let i = 0; i < lightCount; i++)
        {
            const light = lights[i];

            light.init(renderer, this.contextChanged);

            const shader = light.shader;

            if (i === 0)
            {
                const quad = this.quad;
                const vertices = quad.vertices;
                const uvs = quad.uvs;

                renderer.bindVao(null);
                quad.initVao(shader);

                for (let i = 0; i < 8; i++)
                {
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
                renderer.bindVao(quad.vao);
            }

            if (lastShader !== shader)
            {
                lastShader = shader;
                renderer.bindShader(shader);
            }

            shader.uniforms.uSampler = uSamplerLocation;
            shader.uniforms.uNormalSampler = uNormalSamplerLocation;
            shader.uniforms.uWorldMatrix = uWorldMatrix;
            shader.uniforms.uFixedNormal = !!sprite.fixedNormal;

            light.syncShader(sprite);

            renderer.state.setBlendMode(light.blendMode);

            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
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
        /* eslint-disable camelcase */
        sprite._bak_pluginName_LightSprite = sprite.pluginName;
        sprite._bak__texture_LightSprite = sprite._texture;
        sprite._bak_diffuseTexture_LightSprite = sprite.diffuseTexture;
        sprite._bak__renderWebGL_LightSprite = sprite._renderWebGL;

        sprite.pluginName = LightSpriteRenderer.pluginName;
        sprite.diffuseTexture = sprite.diffuseTexture || sprite._texture;
        sprite._renderWebGL = LightSpriteRenderer.__renderWebGL_Sprite;
        /* eslint-enable camelcase */
    }

    static unapplyTo(sprite)
    {
        /* eslint-disable camelcase */
        if (sprite._bak__renderWebGL_LightSprite)
        {
            sprite.pluginName = sprite._bak_pluginName_LightSprite;
            sprite._texture = sprite._bak__texture_LightSprite;
            sprite.diffuseTexture = sprite._bak_diffuseTexture_LightSprite;
            sprite._renderWebGL = sprite._bak__renderWebGL_LightSprite;

            sprite._bak_pluginName_LightSprite = null;
            sprite._bak__texture_LightSprite = null;
            sprite._bak_diffuseTexture_LightSprite = null;
            sprite._bak__renderWebGL_LightSprite = null;
        }
        /* eslint-enable camelcase */
    }

    static __renderWebGL_Sprite(renderer) // eslint-disable-line camelcase
    {
        const sprite = this;

        sprite.calculateVertices();

        if (renderer.renderingDiffuses)
        {
            // const originalTexture = sprite._texture;
            const diffuseTexture = sprite.diffuseTexture || sprite._texture;

            sprite._texture = diffuseTexture;

            renderer.setObjectRenderer(renderer.plugins.sprite);
            renderer.plugins.sprite.render(sprite);

            return;
        }

        if (renderer.renderingNormals)
        {
            // const originalTexture = sprite._texture;
            const normalTexture = sprite.normalTexture || LightSpriteRenderer.defaultNormalTexture;

            sprite._texture = normalTexture;

            renderer.setObjectRenderer(renderer.plugins.sprite);
            renderer.plugins.sprite.render(sprite);

            return;
        }

        renderer.setObjectRenderer(renderer.plugins.lightSprite);
        renderer.plugins.lightSprite.render(sprite);
    }
}

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

canvas.width = canvas.height = 10;
context.fillStyle = '#8080FF';
context.fillRect(0, 0, canvas.width, canvas.height);
LightSpriteRenderer.defaultNormalTexture = Texture.from(canvas);
LightSpriteRenderer.pluginName = 'lightSprite';
WebGLRenderer.registerPlugin(LightSpriteRenderer.pluginName, LightSpriteRenderer);

