/**
 * @namespace PIXI.renderers
 */
export { default as LightSpriteRenderer } from './light/LightSpriteRenderer';
export { default as PerspectiveRenderer } from './perspective/PerspectiveRenderer';
export { default as DisplayPoint } from './point/DisplayPoint';
export { default as PointRenderer } from './point/PointRenderer';
export { default as DisplayPointGroup } from './point/DisplayPointGroup';
export { default as PointGroupRenderer } from './point/PointGroupRenderer';
export { default as TrailRenderer } from './trail/TrailRenderer';

import * as lights from './light/lights';
export { lights };
