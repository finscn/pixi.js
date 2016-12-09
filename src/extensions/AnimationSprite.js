import * as core from '../core';

const Texture = core.Texture;
const Sprite = core.Sprite;

/**
 * @typedef FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The texture object of the frame
 * @property {number} [duration] - the duration of the frame in ms
 * @property {array} [pivot] - the pivot(ratio) of the frame. Index 0 is x; Index 1 is y.
 *
 * If no `frame.duration`, frame.duration will equal `animation.duration / frames.length`
 * If no `frame.pivot`, frame.pivot will be null, then AnimationSprite use default or original or previous pivot.
 * Some private fileds will be generated dynamically:
 *     {number} _startTime:
 *     {number} _endTime:
 */

/**
 * An AnimationSprite is a simple way to display an animation depicted by a list of frames
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extensions
 */
export default class AnimationSprite extends Sprite
{
    /**
     * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
     *  objects that make up the animation
     * @param {number} [duration=0] - The total duration of animation in ms
     *     If no `duration`, the duration will equal the sum of all `frame.duration`
     */
    constructor(frames, duration)
    {
        super(frames[0] instanceof Texture ? frames[0] : frames[0].texture);

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
         * Function to call when a AnimationSprite finishes playing
         *
         * @method
         * @memberof PIXI.extensions.AnimationSprite#
         */
        this.onComplete = null;

        /**
         * The index of the frame displayed when animation finished.
         *
         * @member {number}
         * @default 0
         */
        this.endIndex = 0;

        /**
         * Function to call when a AnimationSprite frame changes
         *
         * @method
         * @memberof PIXI.extensions.AnimationSprite#
         */
        this.onFrameChange = null;

        /**
         * Elapsed time since animation has been started, used internally to display current texture
         *
         * @member {number}
         */
        this.currentTime = 0;

        /**
         * Indicates if the AnimationSprite is currently playing
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
        * The AnimatedSprites current frame index
        *
        * @member {number}
        * @memberof PIXI.extras.AnimatedSprite#
        * @readonly
        */
        this.currentIndex = -1;

        /**
        * The AnimatedSprites current frame object
        *
        * @member {object}
        * @memberof PIXI.extras.AnimatedSprite#
        * @readonly
        */
        this.currentFrame = null;

        /**
         * `frameCount` is the total number of frames in the AnimationSprite
         *
         * @member {number}
         * @default 0
         */
        this.frameCount = 0;

        /**
         * @private
         */
        this._maxIndex = -1;

        this.duration = duration || 0;

        /**
         * @private
         */
        this._frames = [];

        this.frames = frames;
    }

    /**
     * Play the AnimationSprite
     *
     */
    play()
    {
        this.playing = true;
    }

    /**
     * Pause the AnimationSprite
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
     * Stop the AnimationSprite
     *
     */
    stop()
    {
        this.gotoAndStop(0);
    }

    /**
     * Go to a specific frame and begins playing the AnimationSprite
     *
     * @param {number} frameIndex - frame index to start at
     */
    gotoAndPlay(frameIndex)
    {
        if (frameIndex !== this.currentIndex)
        {
            this.frameChange(frameIndex);
        }
        this.currentTime = this.currentFrame._startTime;
        this.play();
    }

    /**
     * Stop the AnimationSprite and goes to a specific frame
     *
     * @param {number} frameIndex - frame index to stop at
     */
    gotoAndStop(frameIndex)
    {
        this.pause();

        if (frameIndex !== this.currentIndex)
        {
            this.frameChange(frameIndex);
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

        do {
            frame = frames[index];
            if (time < frame._startTime)
            {
                // Play backward
                if (index === 0)
                {
                    if (this.loop === true || (--this.loop) > 0 )
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
                if (this.loop === true || (--this.loop) > 0 )
                {
                    time -= duration;
                    index = 0;
                    continue;
                }
                completed = true;
                break;
            }
            index++;
        } while (skipFrame);

        this.currentTime = time;

        if (completed)
        {
            this.playing = false;

            if (lastIndex !== this.endIndex)
            {
                this.frameChange(this.endIndex);
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
            this.frameChange(index);

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
     * Function to call when a AnimationSprite changes which texture is being rendered
     *
     * @param {number} frameIndex - new frame index
     * @private
     */
    frameChange(frameIndex)
    {
        this.currentIndex = frameIndex;

        const frame = this.currentFrame = this._frames[frameIndex];

        if (frame.pivot)
        {
            const pivot = frame.pivot;
            this.transform.pivot.set(pivot[0], pivot[1]);
        }

        this.updateTexture();

        if (this.onFrameChange)
        {
            this.onFrameChange(frameIndex, frame);
        }
    }

    /**
     * Update the displayed texture to match the current frame index
     *
     * @private
     */
    updateTexture()
    {
        this._texture = this.currentFrame.texture;
        this._textureID = -1;
    }

    /**
     * Destroy the AnimationSprite
     *
     */
    destroy()
    {
        this.frames = null;
        super.destroy();
    }

    /**
     * The array of frame objects used for this AnimationSprite
     *
     * @member {FrameObject[]}
     * @memberof PIXI.extensions.AnimationSprite#
     */
    get frames()
    {
        return this._frames;
    }

    /**
     * Set the frames.
     *
     * @param {PIXI.Texture[]|FrameObject[]} value - The frames to set
     */
    set frames(value)
    {
        this.playing = false;
        this._frames.length = 0;

        if (!value)
        {
            this.frameCount = 0;
            this._maxIndex = -1;
            this.currentTime = 0;
            this.currentIndex = -1;
            this.currentFrame = null;
            return;
        }

        const len = this.frameCount = value.length;

        this._maxIndex = len - 1;

        const preDuration = this.duration / len;
        const useTexture = value[0] instanceof core.Texture;

        let startTime = 0;
        let endTime = 0;
        let frame;

        for (let i = 0; i < len; i++)
        {
            if (useTexture)
            {
                frame = {
                    texture: value[i],
                };
            }
            else
            {
                frame = value[i];
            }
            this._frames.push(frame);

            frame.duration = frame.duration || preDuration;
            frame.pivot = frame.pivot || null;

            frame._startTime = startTime;
            frame._endTime = (endTime += frame.duration);

            startTime = endTime;
        }

        if (!this.duration || this.duration < endTime)
        {
            this.duration = endTime;
        }

        this.currentIndex = 0;
        this.currentFrame = this._frames[0];
        if (this.currentFrame.pivot)
        {
            const a = this.currentFrame.pivot;
            this.transform.pivot.set(a[0], a[1]);
        }
    }

}
