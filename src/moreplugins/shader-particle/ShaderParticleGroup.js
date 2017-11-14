import DisplayObject from '../../core/display/DisplayObject';

/**
 * The Sprite object is the base for all textured objects that are rendered to the screen
 *
 * A sprite can be created directly from an image like this:
 *
 * ```js
 * let sprite = new PIXI.Sprite.fromImage('assets/image.png');
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export default class ShaderParticleGroup extends DisplayObject
{
    /**
     * @param {Array} particles - The texture for this sprite
     */
    constructor(particles)
    {
        //
        super();

        this.particles = particles;
        this.statusList = null;
        this.display = null;

        this.pluginName = 'shaderparticle';
    }

    setStatusList(statusList)
    {
        this.statusList = statusList;
    }

    setDisplay(display)
    {
        this.display = display;
    }

    init(gl)
    {
        const particleGroup = this;

        this.statusList.forEach(function (status)
        {
            status.init(gl, particleGroup);
        });
        this.display.init(gl, particleGroup);

        this.inited = true;
    }

    update(timeStep, now)
    {
        const particleGroup = this;

        this.statusList.forEach(function (status)
        {
            status.update(particleGroup, timeStep, now);
        });

        this.display.update(particleGroup, timeStep, now);
    }

    renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    }
}
