import { BLEND_MODES } from '../../core/const';
import { Point } from '../../core/math';
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
     * @param {ShaderParticle} particle - The particle for this group
     * @param {number} particleCount - The count of particles
     */
    constructor(particle, particleCount)
    {
        //
        super();

        this.particle = particle;
        this.particleCount = particleCount;

        this.alpha = 1;
        this.colorMultiplier = 1;
        this.colorOffset = new Float32Array([0.0, 0.0, 0.0]);
        this.position = new Point(0, 0);

        this.blendMode = BLEND_MODES.NORMAL;

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

    updateStatus(renderer, timeStep, now)
    {
        const particleGroup = this;

        this.statusList.forEach(function (status)
        {
            status.update(renderer, particleGroup, timeStep, now);
        });
    }

    bindTexture(renderer, texture, textureIndex)
    {
        const gl = renderer.gl;

        renderer.boundTextures[textureIndex] = renderer.emptyTextures[textureIndex];
        gl.activeTexture(gl.TEXTURE0 + textureIndex);

        texture.bind();
    }

    renderCanvas()
    {
        // nothing to do
    }

    renderWebGL(renderer)
    {
        renderer.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);

        this.statusList.forEach(function (status)
        {
            status.swapRenderTarget();
        });
    }
}
