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
const renderers = ext.renderers;
const lights = ext.lights;
const Matrix3 = ext.Matrix3;
const SimpleContainer = ext.SimpleContainer;
const SimpleParticleContainer = ext.SimpleParticleContainer;
const SimpleSprite = ext.SimpleSprite;
export {
    extensions,
    renderers,
    lights,
    Matrix3,
    SimpleContainer,
    SimpleParticleContainer,
    SimpleSprite,
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
