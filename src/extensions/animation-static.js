import * as core from '../core';
import * as mesh from '../mesh';
import Animation from './Animation.js';

const Texture = core.Texture;
const Sprite = core.Sprite;
const Rope = mesh.Rope;
const Plane = mesh.Plane;

/**
 * Mixin properties of Animation to a display object , let it become a animation object
 *
 *@param {PIXI.Sprite|PIXI.mesh.Plane|PIXI.mesh.Rope} displayObject - the object to apply
 */
Animation.applyTo = function (displayObject)
{
    const properties = [
        // 'initAnimation',
        'play',
        'pause',
        'resume',
        'stop',
        'gotoAndPlay',
        'gotoAndStop',
        'update',
        'updateByTime',
        'changeFrame',
        'getNextFrame',
        'updateTarget',
        'getTarget',
        'getFrames',
        'setFrames',
        'onFrameChange',
        'onComplete',
    ];

    properties.forEach(function (p)
    {
        displayObject[p] = Animation.prototype[p];
    });
    displayObject._initAnimation = Animation.prototype.initAnimation;
    displayObject.initAnimation = function (frames, duration)
    {
        this._initAnimation(frames, duration);
        this._target = this;
        this._bindName = '_anim';
        this.changeFrame(this._minIndex, null);
    };
};

/**
 * Create a Sprite with animation
 *
 * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
 *  objects that make up the animation
 * @param {number} [duration=0] - The total duration of animation in ms
 *     If no `duration`, the duration will equal the sum of all `frame.duration`
 *
 * @return {PIXI.Sprite} a sprite with animation
 */
Animation.createSprite = function (frames, duration)
{
    const sprite = new Sprite(Texture.EMPTY);

    Animation.applyTo(sprite);
    sprite.initAnimation(frames, duration);

    return sprite;
};

/**
 * Create a Rope Mesh with animation
 *
 * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
 *  objects that make up the animation
 * @param {number} [duration=0] - The total duration of animation in ms
 *     If no `duration`, the duration will equal the sum of all `frame.duration`
 * @param {number} [verticesX=2] - How many vertices on diameter of the rope
 * @param {number} [verticesY=2] - How many vertices on meridian of the rope, make it 2 or 3
 * @param {number} [direction=0] - Direction of the rope. See {@link PIXI.GroupD8} for explanation
 *
 * @return {PIXI.mesh.Rope} a mesh rope with animation
 */
Animation.createRopeMesh = function (frames, duration, verticesX, verticesY, direction)
{
    const rope = new Rope(Texture.EMPTY, verticesX, verticesY, direction);

    Animation.applyTo(rope);
    rope.initAnimation(frames, duration);

    return rope;
};

/**
 * Create a Plane Mesh with animation
 *
 * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
 *  objects that make up the animation
 * @param {number} [duration=0] - The total duration of animation in ms
 *     If no `duration`, the duration will equal the sum of all `frame.duration`
 * @param {number} [verticesX=2] - The number of vertices in the x-axis
 * @param {number} [verticesY=2] - The number of vertices in the y-axis
 * @param {number} [direction=0] - Direction of the mesh. See {@link PIXI.GroupD8} for explanation
 *
 * @return {PIXI.mesh.Plane} a mesh plane with animation
 */
Animation.createPlaneMesh = function (frames, duration, verticesX, verticesY, direction)
{
    const plane = new Plane(Texture.EMPTY, verticesX, verticesY, direction);

    Animation.applyTo(plane);
    plane.initAnimation(frames, duration);

    return plane;
};
