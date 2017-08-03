// import polyfills. Done as an export to make sure polyfills are imported first
export * from './polyfill';

// export core
export * from './core';

// export libs
import deprecation from './deprecation';
import * as accessibility from './accessibility';
import * as extract from './extract';
import * as extras from './extras';
import * as filters from './filters';
import * as interaction from './interaction';
import * as loaders from './loaders';
import * as mesh from './mesh';
import * as particles from './particles';
import * as prepare from './prepare';

// handle mixins now, after all code has been added, including deprecation
import { utils } from './core';
utils.mixins.performMixins();

/**
 * Alias for {@link PIXI.loaders.shared}.
 * @name loader
 * @memberof PIXI
 * @type {PIXI.loader.Loader}
 */
const loader = loaders.shared || null;

export {
    accessibility,
    extract,
    extras,
    filters,
    interaction,
    loaders,
    mesh,
    particles,
    prepare,
    loader,
};

// Apply the deprecations
if (typeof deprecation === 'function')
{
    deprecation(exports);
}

// load extensions
import * as extensions from './extensions';
const ext = extensions;
const Matrix3 = ext.Matrix3;
const SimpleContainer = ext.SimpleContainer;
const SimpleParticleContainer = ext.SimpleParticleContainer;
const LeafSprite = ext.LeafSprite;
const Animation = ext.Animation;
const SpriteTrail = ext.SpriteTrail;
const RenderContext = ext.RenderContext;

import * as morefilters from './morefilters';
for (const key in morefilters)
{
    filters[key] = morefilters[key];
}

import * as morerenderers from './morerenderers';
const renderers = morerenderers || {};
const lights = renderers.lights;
const DisplayPoint = renderers.DisplayPoint;
const DisplayPointGroup = renderers.DisplayPointGroup;

export {
    extensions,
    Matrix3,
    SimpleContainer,
    SimpleParticleContainer,
    LeafSprite,
    Animation,
    SpriteTrail,
    RenderContext,

    renderers,
    lights,
    DisplayPoint,
    DisplayPointGroup,
};

// Always export PixiJS globally.
global.PIXI = exports; // eslint-disable-line

