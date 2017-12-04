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

import * as extFilters from './ext-filters';
for (const key in extFilters)
{
    filters[key] = extFilters[key];
}

import * as extPlugins from './ext-plugins';

const plugins = extPlugins || {};

const lights = plugins.lighting;

const DisplayPoint = plugins.DisplayPoint;
const DisplayPointGroup = plugins.DisplayPointGroup;

const ShaderParticle = plugins.ShaderParticle;
const ShaderParticleDisplay = plugins.ShaderParticleDisplay;
const ShaderParticleStatus = plugins.ShaderParticleStatus;

export {
    extensions,
    Matrix3,
    SimpleContainer,
    SimpleParticleContainer,
    LeafSprite,
    Animation,
    SpriteTrail,
    RenderContext,

    lights,
    DisplayPoint,
    DisplayPointGroup,

    ShaderParticle,
    ShaderParticleDisplay,
    ShaderParticleStatus,
};

// Always export PixiJS globally.
global.PIXI = exports; // eslint-disable-line

