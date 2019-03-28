import * as core from '../core';
import * as mesh from '../mesh';
import Animation from './Animation.js';

const Texture = core.Texture;
const Sprite = core.Sprite;
const Rope = mesh.Rope;
const Plane = mesh.Plane;

/**
 * Create a Sprite with animation
 *
 * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
 *  objects that make up the animation
 * @param {number} [duration=0] - The total duration of animation in ms
 *     If no `duration`, the duration will equal the sum of all `frame.duration`
 * @param {string} animBindName - The name of bind-animation
 *
 * @return {PIXI.Sprite} a sprite with animation
 */
Animation.createSprite = function (frames, duration, animBindName)
{
    const sprite = new Sprite(Texture.EMPTY);

    const anim = new Animation(frames, duration);

    anim.bind(sprite, animBindName);
    anim.gotoAndPlay(0);

    return sprite;
};

/**
 * Create a Rope Mesh with animation
 *
 * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
 *  objects that make up the animation
 * @param {number} [duration=0] - The total duration of animation in ms
 *     If no `duration`, the duration will equal the sum of all `frame.duration`
 * @param {string} animBindName - The name of bind-animation
 * @param {number} [verticesX=2] - How many vertices on diameter of the rope
 * @param {number} [verticesY=2] - How many vertices on meridian of the rope, make it 2 or 3
 * @param {number} [direction=0] - Direction of the rope. See {@link PIXI.GroupD8} for explanation
 *
 * @return {PIXI.mesh.Rope} a mesh rope with animation
 */
Animation.createRopeMesh = function (frames, duration, animBindName, verticesX, verticesY, direction)
{
    const rope = new Rope(Texture.EMPTY, verticesX, verticesY, direction);

    const anim = new Animation(frames, duration);

    anim.bind(rope, animBindName);
    anim.gotoAndPlay(0);

    return rope;
};

/**
 * Create a Plane Mesh with animation
 *
 * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
 *  objects that make up the animation
 * @param {number} [duration=0] - The total duration of animation in ms
 *     If no `duration`, the duration will equal the sum of all `frame.duration`
 * @param {string} animBindName - The name of bind-animation
 * @param {number} [verticesX=2] - The number of vertices in the x-axis
 * @param {number} [verticesY=2] - The number of vertices in the y-axis
 * @param {number} [direction=0] - Direction of the mesh. See {@link PIXI.GroupD8} for explanation
 *
 * @return {PIXI.mesh.Plane} a mesh plane with animation
 */
Animation.createPlaneMesh = function (frames, duration, animBindName, verticesX, verticesY, direction)
{
    const plane = new Plane(Texture.EMPTY, verticesX, verticesY, direction);

    const anim = new Animation(frames, duration);

    anim.bind(plane, animBindName);
    anim.gotoAndPlay(0);

    return plane;
};
