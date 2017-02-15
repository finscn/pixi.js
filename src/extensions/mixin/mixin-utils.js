import * as core from '../../core';

const utils = core.utils;
const Texture = core.Texture;
const Sprite = core.Sprite;
const BaseTexture = core.BaseTexture;
const Rectangle = core.Rectangle;

utils.log = function (/* arge */)
{
    window.console.log.apply(window.console, arguments);
};

utils.createBaseTexture = function (image)
{
    if (typeof image === 'string')
    {
        return BaseTexture.fromImage(image);
    }

    return BaseTexture.from(image);
};

utils.createTexture = function (image, sx, sy, sw, sh)
{
    const baseTexture = utils.createBaseTexture(image);
    let rect;

    if (sw && sh)
    {
        rect = new Rectangle(sx, sy, sw, sh);
    }

    const texture = new Texture(baseTexture, rect);

    return texture;
};

utils.createSprite = function (image, sx, sy, sw, sh)
{
    const texture = utils.createTexture(image, sx, sy, sw, sh);
    const srptie = new Sprite(texture);

    return srptie;
};

utils.createAnimation = function (textures, totalDuration, loop)
{
    const sprite = core.Animation.createSprite(textures, totalDuration);

    sprite.loop = !!loop;

    return sprite;
};
