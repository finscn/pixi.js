let FLOATING_POINT_AVAILABLE = false;

/**
 * Helper class to create a WebGL Texture
 *
 * @class
 * @memberof PIXI.glCore
 * @param gl {WebGLRenderingContext} The current WebGL context
 * @param width {number} the width of the texture
 * @param height {number} the height of the texture
 * @param format {number} the pixel format of the texture. defaults to gl.RGBA
 * @param type {number} the gl type of the texture. defaults to gl.UNSIGNED_BYTE
 */
export default class Texture
{
    constructor(gl, width, height, format, type)
    {
        /**
         * The current WebGL rendering context
         *
         * @member {WebGLRenderingContext}
         */
        this.gl = gl;

        /**
         * The WebGL texture
         *
         * @member {WebGLTexture}
         */
        this.texture = gl.createTexture();

        /**
         * If mipmapping was used for this texture, enable and disable with enableMipmap()
         *
         * @member {Boolean}
         */
        // some settings..
        this.mipmap = false;

        /**
         * Set to true to enable pre-multiplied alpha
         *
         * @member {Boolean}
         */
        this.premultiplyAlpha = false;

        /**
         * The width of texture
         *
         * @member {Number}
         */
        this.width = width || -1;
        /**
         * The height of texture
         *
         * @member {Number}
         */
        this.height = height || -1;

        /**
         * The pixel format of the texture. defaults to gl.RGBA
         *
         * @member {Number}
         */
        this.format = format || gl.RGBA;

        /**
         * The gl type of the texture. defaults to gl.UNSIGNED_BYTE
         *
         * @member {Number}
         */
        this.type = type || gl.UNSIGNED_BYTE;
    }

    /**
     * Uploads this texture to the GPU
     * @param source {HTMLImageElement|ImageData|HTMLVideoElement} the source image of the texture
     */
    upload(source)
    {
        this.bind();

        const gl = this.gl;

        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

        const newWidth = source.videoWidth || source.width;
        const newHeight = source.videoHeight || source.height;

        if (newHeight !== this.height || newWidth !== this.width)
        {
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, this.type, source);
        }
        else
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.format, this.type, source);
        }

        // if the source is a video, we need to use the videoWidth / videoHeight
        // properties as width / height will be incorrect.
        this.width = newWidth;
        this.height = newHeight;
    }

    /**
     * Use a data source and uploads this texture to the GPU
     * @param data {TypedArray} the data to upload to the texture
     * @param width {number} the new width of the texture
     * @param height {number} the new height of the texture
     */
    uploadData(data, width, height)
    {
        this.bind();

        const gl = this.gl;

        if (data instanceof Float32Array)
        {
            if (!FLOATING_POINT_AVAILABLE)
            {
                const ext = gl.getExtension('OES_texture_float');

                if (ext)
                {
                    FLOATING_POINT_AVAILABLE = true;
                }
                else
                {
                    throw new Error('floating point textures not available');
                }
            }

            this.type = gl.FLOAT;
        }
        else
        {
            // TODO support for other types
            this.type = this.type || gl.UNSIGNED_BYTE;
        }

        // what type of data?
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

        if (width !== this.width || height !== this.height)
        {
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, data || null);
        }
        else
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, this.format, this.type, data || null);
        }

        this.width = width;
        this.height = height;
    }

    /**
     * Binds the texture
     * @param  location
     */
    bind(location)
    {
        const gl = this.gl;

        if (location !== undefined)
        {
            gl.activeTexture(gl.TEXTURE0 + location);
        }

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    /**
     * Unbinds the texture
     */
    unbind()
    {
        const gl = this.gl;

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * @param linear {Boolean} if we want to use linear filtering or nearest neighbour interpolation
     */
    minFilter(linear)
    {
        const gl = this.gl;

        this.bind();

        if (this.mipmap)
        {
            /* eslint-disable max-len */
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
            /* eslint-disable max-len */
        }
        else
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linear ? gl.LINEAR : gl.NEAREST);
        }
    }

    /**
     * @param linear {Boolean} if we want to use linear filtering or nearest neighbour interpolation
     */
    magFilter(linear)
    {
        const gl = this.gl;

        this.bind();

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linear ? gl.LINEAR : gl.NEAREST);
    }

    /**
     * Enables mipmapping
     */
    enableMipmap()
    {
        const gl = this.gl;

        this.bind();

        this.mipmap = true;

        gl.generateMipmap(gl.TEXTURE_2D);
    }

    /**
     * Enables linear filtering
     */
    enableLinearScaling()
    {
        this.minFilter(true);
        this.magFilter(true);
    }

    /**
     * Enables nearest neighbour interpolation
     */
    enableNearestScaling()
    {
        this.minFilter(false);
        this.magFilter(false);
    }

    /**
     * Enables clamping on the texture so WebGL will not repeat it
     */
    enableWrapClamp()
    {
        const gl = this.gl;

        this.bind();

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    enableWrapRepeat()
    {
        const gl = this.gl;

        this.bind();

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    enableWrapMirrorRepeat()
    {
        const gl = this.gl;

        this.bind();

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    }

    /**
     * Destroys this texture
     */
    destroy()
    {
        const gl = this.gl;
        // TODO

        gl.deleteTexture(this.texture);
    }

    /**
     * @static
     * @param gl {WebGLRenderingContext} The current WebGL context
     * @param source {HTMLImageElement|ImageData} the source image of the texture
     * @param premultiplyAlpha {Boolean} If we want to use pre-multiplied alpha
     */
    static fromSource(gl, source, premultiplyAlpha)
    {
        const texture = new Texture(gl);

        texture.premultiplyAlpha = premultiplyAlpha || false;
        texture.upload(source);

        return texture;
    }

    /**
     * @static
     * @param gl {WebGLRenderingContext} The current WebGL context
     * @param data {TypedArray} the data to upload to the texture
     * @param width {number} the new width of the texture
     * @param height {number} the new height of the texture
     */
    static fromData(gl, data, width, height)
    {
        // console.log(data, width, height);
        const texture = new Texture(gl);

        texture.uploadData(data, width, height);

        return texture;
    }
}
