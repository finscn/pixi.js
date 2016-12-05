// import polyfills
import './polyfill';

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
for (const key in ext.filters) {
    filters[key] = ext.filters[key];
}
const _renderers = ext.renderers;
const _lights = ext.lights;
const _Matrix3 = ext.Matrix3;
const _SimpleContainer = ext.SimpleContainer;
const _SimpleParticleContainer = ext.SimpleParticleContainer;
const _SimpleSprite = ext.SimpleSprite;
export {
    extensions,
    _renderers as renderers,
    _lights as lights,
    _Matrix3 as Matrix3,
    _SimpleContainer as SimpleContainer,
    _SimpleParticleContainer as SimpleParticleContainer,
    _SimpleSprite as SimpleSprite,
};
// export {
//     renderers,
//     lights,
//     SimpleContainer,
//     SimpleParticleContainer,
//     SimpleSprite,
// } from './extensions';

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
