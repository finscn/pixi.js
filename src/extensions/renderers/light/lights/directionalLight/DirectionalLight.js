import LightWithAmbient from '../light/LightWithAmbient';

// @see https://github.com/substack/brfs/issues/25
const glslify = require('glslify'); // eslint-disable-line no-undef

export default class DirectionalLight extends LightWithAmbient
{
    constructor(options)
    {
        options = options || {};

        super(options);

        this.target = options.target || {
            x: 0,
            y: 0,
        };

        if (!('z' in this.target))
        {
            this.target.z = 10;
        }

        this.directionArray = new Float32Array(3);
        this.updateDirection();

        this.shaderName = 'directionalLightShader';
    }

    getVertexSource()
    {
        const vertexSrc = glslify('./directional.vert');

        return vertexSrc;
    }

    getFragmentSource()
    {
        const fragmentSrc = glslify('./directional.frag');

        return fragmentSrc;
    }

    updateDirection()
    {
        const arr = this.directionArray;
        const tx = this.target.x;
        const ty = this.target.y;
        const tz = this.target.z;

        arr[0] = this.position.x - tx;
        arr[1] = this.position.y - ty;
        arr[2] = this.position.z - tz;
    }

    syncShader(sprite)
    {
        super.syncShader(sprite);

        this.shader.uniforms.uLightDirection = this.directionArray;
    }
}
