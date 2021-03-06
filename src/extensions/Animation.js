import Texture from '../core/textures/Texture';

/**
 * example:
 *
 * ```
 * // create an Animation , and bind with a sprite.
 * var anim = new PIXI.Animation(frames);
 * anim.bind(sprite);
 * ```
 *
 * in game tick:
 * ```
 * anim.update(deltaTime);
 * ```
 */

/**
 * @typedef FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture - The texture object of the frame
 * @property {number} [duration|time] - the duration of the frame in ms
 * @property {number[]} [pivot] - the pivot of the frame. Index 0 is x; Index 1 is y.
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
 * @memberof PIXI.extensions
 */
export default class Animation
{
    /**
     * @param {PIXI.Texture[]|FrameObject[]} frames - an array of {@link PIXI.Texture} or frame
     *  objects that make up the animation
     * @param {number} [duration=0] - The total duration of animation in ms
     *     If no `duration`, the duration will equal the sum of all `frame.duration`
     * @param {string} [defaultBindName='anim'] - The default value of `property name of target for binding`
     *     If defaultBindName === null/false/'' , will not set anim-instance to target
     */
    constructor(frames, duration, defaultBindName = 'anim')
    {
        this.defaultBindName = defaultBindName;

        this._target = null;
        this._bindName = null;
        this._frames = null;

        this.firstTexture = null;

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
         * Whether allow to skip frames if timeStep too large.
         *
         * @member {boolean}
         * @default false
         */
        this.skipFrame = false;

        /**
         * The default pivot of the animation(the default pivot of all frames).
         * Index 0 is x; Index 1 is y.
         * if it's null/undefined/false/0/''/non-number[] , means x = 0 & y = 0.
         *
         * @member {number[]}
         * @default null
         */
        this.defaultPivot = null;

        this.duration = duration || 0;

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
         * Function to call when 'loop' is true, and an Animation Object is played and loops around to start again
         *
         * @member {Function}
         */
        this.onLoop = null;

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
     * Go to a specific frame
     *
     * @param {number} frameIndex - frame index to start at
     */
    goto(frameIndex)
    {
        if (frameIndex !== this.currentIndex)
        {
            this.changeFrame(frameIndex, this.currentIndex);
        }
        this.currentTime = this.currentFrame._startTime;
    }

    /**
     * Go to a specific frame and begins playing the Animation
     *
     * @param {number} frameIndex - frame index to start at
     */
    gotoAndPlay(frameIndex)
    {
        this.goto(frameIndex);
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
        this.goto(frameIndex);
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
        let index = this.currentIndex;

        if (index < this._minIndex || index > this._maxIndex)
        {
            return;
        }

        const prevIndex = index;
        const duration = this.duration;
        const frames = this._frames;

        let completed = false;
        let frame;

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
                        if (this.onLoop)
                        {
                            this.onLoop();
                        }
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
                    if (this.onLoop)
                    {
                        this.onLoop();
                    }
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

            if (prevIndex !== this.completeIndex)
            {
                this.changeFrame(this.completeIndex, prevIndex);
                this.currentTime = this.currentFrame._startTime;
            }
            if (this.onComplete)
            {
                this.onComplete();
            }

            return;
        }

        if (prevIndex !== index)
        {
            this.changeFrame(index, prevIndex);

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
     * @param {number} prevIndex - previous frame index
     * @private
     */
    changeFrame(frameIndex, prevIndex)
    {
        this.currentIndex = frameIndex;

        const frame = this.getNextFrame(frameIndex, prevIndex);

        this.currentFrame = frame;
        this.currentTexture = frame.texture;

        this.updateTarget();

        if (this.onFrameChange)
        {
            this.onFrameChange(frameIndex, frame);
        }
    }

    /**
     * Get next frame.
     * User could OVERRIDE this method to implement custom animation order.
     *
     * @param {number} frameIndex - new frame index
     * @param {number} prevIndex - previous frame index
     * @return {FrameObject} The next frame object in animation
     * @private
     */
    getNextFrame(frameIndex, prevIndex) // eslint-disable-line no-unused-vars
    {
        return this._frames[frameIndex];
    }

    /**
     * Updates the displayed texture to match the current frame index
     *
     * @private
     */
    updateTarget()
    {
        this._target._texture = this.currentTexture;
        this._target._textureID = -1;
        this._target.cachedTint = 0xFFFFFF;

        // TODO: Shall we need `pivot` ?
        const pivot = this.currentFrame.pivot || this.defaultPivot;

        if (pivot)
        {
            this._target.transform.pivot.set(pivot[0], pivot[1]);
        }

        // // TODO: `refresh` is hard code , not good enough.
        // if (this._target.refresh)
        // {
        //     this._target.refresh();
        // }

        this._target._onTextureUpdate();
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
            this._minIndex = -1;
            this._maxIndex = -1;
            this.firstTexture = null;

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

            frame.duration = frame.duration || frame.time || preDuration;

            // TODO:
            frame.pivot = frame.pivot || null;

            // TODO:
            frame.offset = frame.offset || null;

            frame._startTime = startTime;
            frame._endTime = (endTime += frame.duration);

            startTime = endTime;
        }

        if (!this.duration || this.duration < endTime)
        {
            this.duration = endTime;
        }

        // TODO: Shall we need `firstTexture` ?
        this.firstTexture = this._frames[0].texture;
    }

    /**
     * Bind the target of Animation.
     *
     * @param {PIXI.DisplayObject} target - A display object with Texture.
     * @param {string} [bindName] - The property name of target for binding
     */
    bind(target, bindName)
    {
        this.unbind();

        if (!target)
        {
            return;
        }

        this._target = target;

        if (bindName === undefined)
        {
            bindName = this.defaultBindName;
        }

        if (bindName || bindName === 0)
        {
            this._bindName = bindName;
            target[this._bindName] = this;
        }

        // this.changeFrame(this._minIndex, null);
    }

    /**
     * Unbind the target of Animation.
     *
     * @return {PIXI.DisplayObject} The previous target of Animation
     */
    unbind()
    {
        const target = this._target;

        if (target)
        {
            if (this._bindName && target[this._bindName] === this)
            {
                delete target[this._bindName];
            }
            this._target = null;
        }

        return target;
    }

    activate(startIndex)
    {
        this.gotoAndPlay(startIndex || 0);
    }

    /**
     * The target displayObject of Animation
     *
     * @member {PIXI.DisplayObject}
     */
    get target()
    {
        return this._target;
    }

    set target(value) // eslint-disable-line require-jsdoc
    {
        this.bind(value, null);
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
    }
}
