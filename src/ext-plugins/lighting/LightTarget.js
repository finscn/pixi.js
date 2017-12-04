import LightSpriteRenderer from './LightSpriteRenderer';

export default class LightTarget
{
    static applyTo(sprite)
    {
        /* eslint-disable camelcase */
        sprite._bak_pluginName_LightSprite = sprite.pluginName;
        sprite._bak__texture_LightSprite = sprite._texture;
        sprite._bak_diffuseTexture_LightSprite = sprite.diffuseTexture;
        sprite._bak__renderWebGL_LightSprite = sprite._renderWebGL;

        sprite.pluginName = LightSpriteRenderer.pluginName;
        sprite.diffuseTexture = sprite.diffuseTexture || sprite._texture;
        sprite._renderWebGL = LightTarget.__renderWebGL_Sprite;
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
