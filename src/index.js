// import polyfills. Done as an export to make sure polyfills are imported first
export * from './polyfill';

// export core
export * from './deprecation';
export * from './core';

// export libs
import * as accessibility from './accessibility';
import * as extract from './extract';
import * as extras from './extras';
import * as filters from './filters';
import * as interaction from './interaction';
import * as loaders from './loaders';
import * as mesh from './mesh';
import * as particles from './particles';
import * as prepare from './prepare';

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
};

// load extensions
import * as extensions from './extensions';
const ext = extensions;

for (const key in ext.filters)
{
    filters[key] = ext.filters[key];
}
const renderers = ext.renderers;
const DisplayPoint = renderers.DisplayPoint;
const DisplayPointGroup = renderers.DisplayPointGroup;
const lights = ext.lights;
const Matrix3 = ext.Matrix3;
const SimpleContainer = ext.SimpleContainer;
const SimpleParticleContainer = ext.SimpleParticleContainer;
const SimpleSprite = ext.SimpleSprite;
const AnimationSprite = ext.AnimationSprite;
const RenderContext = ext.RenderContext;

export {
    extensions,
    renderers,
    lights,
    DisplayPoint,
    DisplayPointGroup,
    Matrix3,
    SimpleContainer,
    SimpleParticleContainer,
    SimpleSprite,
    AnimationSprite,
    RenderContext,
};

/**
 * A premade instance of the loader that can be used to load resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
const loader = loaders && loaders.Loader ? new loaders.Loader() : null; // check is there in case user excludes loader lib

export { loader };

// Always export pixi globally.
global.PIXI = exports; // eslint-disable-line
