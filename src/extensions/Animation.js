import * as core from '../core';
import * as mesh from '../mesh';

const Texture = core.Texture;

const Sprite = core.Sprite;
const Rope = mesh.Rope;
const Plane = mesh.Plane;

/**
 * @typedef FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The texture object of the frame
 * @property {number} [duration] - the duration of the frame in ms
 * @property {array} [pivot] - the pivot(ratio) of the frame. Index 0 is x; Index 1 is y.
 *
 * If no `frame.duration`, frame.duration will equal `animation.duration / frames.length`
 * If no `frame.pivot`, frame.pivot will be null, then Animation use default or original or previous pivot.
 * Some private fileds will be generated dynamically:
 *     {number} _startTime:
 *     {number} _endTime:
 */

/**
 * An Animation is a simple way to display an animation depicted by a list of frames
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extensions
 */
export default class Animation
{
    /**
     * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
     *  objects that make up the animation
     * @param {number} [duration=0] - The total duration of animation in ms
     *     If no `duration`, the duration will equal the sum of all `frame.duration`
     */
    constructor(frames, duration)
    {
        this.initAnimation(frames, duration);
    }

    /**
     * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
     *  objects that make up the animation
     * @param {number} [duration=0] - The total duration of animation in ms
     *     If no `duration`, the duration will equal the sum of all `frame.duration`
     */
    initAnimation(frames, duration)
    {
        /**
         * Scale the time step when update animation. Higher is faster, lower is slower
         *
         * @member {number}
         * @default 1
         */
        this.timeScale = 1;

        /**
         * Whether or not the animate sprite repeats after playing
         *
         * @member {boolean}
         * @default true
         */
        this.loop = true;

        /**
         * Function to call when a Animation completes playing
         *
         * @method
         * @memberof PIXI.extensions.Animation#
         */
        this.onComplete = null;

        /**
         * The index of the frame displayed when animation finished.
         *
         * @member {number}
         * @default 0
         */
        this.completeIndex = 0;

        /**
         * Function to call when a Animation frame changes
         *
         * @method
         * @memberof PIXI.extensions.Animation#
         */
        this.onFrameChange = null;

        /**
         * Elapsed time since animation has been started, used internally to display current texture
         *
         * @member {number}
         */
        this.currentTime = 0;

        /**
         * Indicates if the Animation is currently playing
         *
         * @member {boolean}
         * @readonly
         */
        this.playing = false;

        /**
         * Whether allow to skip frames if timeStep too large.
         *
         * @member {boolean}
         * @default false
         */
        this.skipFrame = false;

        /**
        * The animation current frame index
        *
        * @member {number}
        * @readonly
        */
        this.currentIndex = -1;

        /**
        * The animation current frame object
        *
        * @member {FrameObject}
        * @memberof PIXI.extensions.Animation#
        * @readonly
        */
        this.currentFrame = null;

        /**
        * The animation current frame object
        *
        * @member {PIXI.Texture}
        * @readonly
        */
        this.currentTexture = null;

        /**
         * `frameCount` is the total number of frames in the Animation
         *
         * @member {number}
         * @default 0
         */
        this.frameCount = 0;

        /**
         * @private
         */
        this._minIndex = -1;
        this._maxIndex = -1;

        this.duration = duration || 0;

        /**
         * @private
         */
        this._frames = [];

        this.setFrames(frames);
    }

    /**
     * Play the Animation
     *
     */
    play()
    {
        this.playing = true;
    }

    /**
     * Pause the Animation
     *
     */
    pause()
    {
        this.playing = false;
    }

    /**
     * Resume playing. In current case , `resume` equals `play`
     *
     */
    resume()
    {
        this.playing = true;
    }

    /**
     * Stop the Animation
     *
     */
    stop()
    {
        this.gotoAndStop(0);
    }

    /**
     * Go to a specific frame and begins playing the Animation
     *
     * @param {number} frameIndex - frame index to start at
     */
    gotoAndPlay(frameIndex)
    {
        if (frameIndex !== this.currentIndex)
        {
            this.changeFrame(frameIndex);
        }
        this.currentTime = this.currentFrame._startTime;
        this.play();
    }

    /**
     * Stop the Animation and goes to a specific frame
     *
     * @param {number} frameIndex - frame index to stop at
     */
    gotoAndStop(frameIndex)
    {
        this.pause();

        if (frameIndex !== this.currentIndex)
        {
            this.changeFrame(frameIndex);
        }
        this.currentTime = this.currentFrame._startTime;
    }

    /**
     * Update the animation by time-step(delta-time)
     *
     * @param {number} timeStep - Time since last tick
     */
    update(timeStep)
    {
        if (!this.playing)
        {
            return;
        }
        const elapsed = this.timeScale * timeStep;
        // const sign = elapsed < 0 ? -1 : 1;

        this.currentTime += elapsed;

        this.updateByTime(this.currentTime, this.skipFrame);
    }

    /**
     * Update the animation by played-time(total-time)
     *
     * @param {number} time - Time since animation has been started
     * @param {boolean} [skipFrame=false] - Whether allow to skip frames if timeStep too large.
     */
    updateByTime(time, skipFrame)
    {
        const duration = this.duration;
        const frames = this._frames;

        let index = this.currentIndex;
        const lastIndex = index;
        let frame;

        let completed = false;

        do
        {
            frame = frames[index];
            if (time < frame._startTime)
            {
                // Play backward
                if (index === this._minIndex)
                {
                    if (this.loop === true || (--this.loop) > 0)
                    {
                        time += duration;
                        index = this._maxIndex;
                        continue;
                    }
                    completed = true;
                    break;
                }
                index--;
                continue;
            }

            if (time < frame._endTime)
            {
                // No frame changed
                break;
            }

            if (index === this._maxIndex)
            {
                // Play forward
                if (this.loop === true || (--this.loop) > 0)
                {
                    time -= duration;
                    index = this._minIndex;
                    continue;
                }
                completed = true;
                break;
            }
            index++;
        } while (skipFrame); // eslint-disable-line no-unmodified-loop-condition

        this.currentTime = time;

        if (completed)
        {
            this.playing = false;

            if (lastIndex !== this.completeIndex)
            {
                this.changeFrame(this.completeIndex);
                this.currentTime = this.currentFrame._startTime;
            }
            if (this.onComplete)
            {
                this.onComplete();
            }

            return;
        }

        if (lastIndex !== index)
        {
            this.changeFrame(index);

            // TODO: Whether snap currentTime to frame ?
            // if (!skipFrame)
            // {
                // Play forward:
                // this.currentTime = this.currentFrame._startTime;

                // Play backward:
                // this.currentTime = this.currentFrame._endTime;
            // }
        }
    }

    /**
     * Function to call when a Animation changes which texture is being rendered
     *
     * @param {number} frameIndex - new frame index
     * @private
     */
    changeFrame(frameIndex)
    {
        this.currentIndex = frameIndex;

        const frame = this.currentFrame = this._frames[frameIndex];

        this.currentTexture = frame.texture;

        // TODO
        if (frame.pivot)
        {
            const pivot = frame.pivot;

            this._host.transform.pivot.set(pivot[0], pivot[1]);
        }

        this.updateTexture();

        if (this.onFrameChange)
        {
            this.onFrameChange(frameIndex, frame);
        }
    }

    /**
     * Updates the displayed texture to match the current frame index
     *
     * @private
     */
    updateTexture()
    {
        this._host._textureID = -1;
        this._host._texture = this.currentTexture;

        // // TODO: `refresh` is hard code , not good enough.
        // if (this._host.refresh)
        // {
        //     this._host.refresh();
        // }

        this._host._onTextureUpdate();
    }

    /**
     * Get the array of frame objects used for this Animation
     *
     * @return {FrameObject[]} The array of frame objects in animation
     * @memberof PIXI.extensions.Animation#
     */
    getFrames()
    {
        return this._frames;
    }

    /**
     * Set the frames.
     *
     * @param {PIXI.Texture[]|FrameObject[]} frames - The frames to set
     */
    setFrames(frames)
    {
        this.playing = false;
        this._frames.length = 0;

        this.currentTime = 0;
        this.currentIndex = -1;
        this.currentFrame = null;
        this.currentTexture = null;

        if (!frames)
        {
            this.frameCount = 0;
            this.completeIndex = 0;
            this.firstTexure = null;
            this._minIndex = -1;
            this._maxIndex = -1;

            return;
        }

        const len = this.frameCount = frames.length;

        this._minIndex = 0;
        this._maxIndex = len - 1;
        this.completeIndex = this._maxIndex;

        const preDuration = this.duration / len;
        const useTexture = frames[0] instanceof Texture;

        let startTime = 0;
        let endTime = 0;
        let frame;

        for (let i = 0; i < len; i++)
        {
            if (useTexture)
            {
                frame = {
                    texture: frames[i],
                };
            }
            else
            {
                frame = frames[i];
            }
            this._frames.push(frame);

            frame.duration = frame.duration || preDuration;
            frame.pivot = frame.pivot || null;

            // TODO
            frame.offset = frame.offset || null;

            frame._startTime = startTime;
            frame._endTime = (endTime += frame.duration);

            startTime = endTime;
        }

        if (!this.duration || this.duration < endTime)
        {
            this.duration = endTime;
        }

        this.firstTexure = this._frames[0].texture;
    }

    /**
     * Get the host of Animation
     *
     * @return {PIXI.DisplayObject} The host of Animation
     */
    getHost()
    {
        return this._host;
    }

    /**
     * Add the animation to a display object.
     *
     * @param {PIXI.DisplayObject} host - The host of Animation
     * @param {string} [bindName='anim'] - The property name of host for binding
     */
    bind(host, bindName)
    {
        this.unbind();
        this._host = host;
        this._bindName = bindName || 'anim';
        this._host[this._bindName] = this;
        this.changeFrame(this._minIndex);
    }

    /**
     * Remove the animation from the display object binded.
     */
    unbind()
    {
        if (this._host)
        {
            delete this._host[this._bindName];
            this._host = null;
        }
    }

    /**
     * Destroy the Animation
     *
     */
    destroy()
    {
        this.unbind();
        this.setFrames(null);
        this._frames = null;
        super.destroy();
    }

    /**
     * Mixin properties of Animation to a display object , let it become a animation object
     *
     *@param {PIXI.Sprite|PIXI.mesh.Plane|PIXI.mesh.Rope} displayObject - the object to apply
     */
    static applyTo(displayObject)
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
            'updateTexture',
            'getHost',
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
            this._host = this;
            this._bindName = '_anim';
            this.changeFrame(this._minIndex);
        };
    }

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
    static createSprite(frames, duration)
    {
        const sprite = new Sprite(Texture.EMPTY);

        Animation.applyTo(sprite);
        sprite.initAnimation(frames, duration);

        return sprite;
    }

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
    static createRopeMesh(frames, duration, verticesX, verticesY, direction)
    {
        const rope = new Rope(Texture.EMPTY, verticesX, verticesY, direction);

        Animation.applyTo(rope);
        rope.initAnimation(frames, duration);

        return rope;
    }

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
    static createPlaneMesh(frames, duration, verticesX, verticesY, direction)
    {
        const plane = new Plane(Texture.EMPTY, verticesX, verticesY, direction);

        Animation.applyTo(plane);
        plane.initAnimation(frames, duration);

        return plane;
    }

}
