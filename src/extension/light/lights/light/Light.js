import * as core from '../../../../core';
import { BLEND_MODES, DRAW_MODES } from '../../../../core/const';
/**
 * Excuse the mess, haven't cleaned this up yet!
 */

export default class Light extends core.DisplayObject
{
    constructor(color, brightness, vertices, indices)
    {
        super();

        this.vertices = vertices || new Float32Array(8);

        this.indices = indices || new Uint16Array([0, 1, 2, 0, 2, 3]);

        this.blendMode = BLEND_MODES.ADD;

        this.drawMode = DRAW_MODES.TRIANGLES;

        this.needsUpdate = true;

        this.height = 0.075;

        this.falloff = [0.75, 3, 20];

        this.shaderName = null;

        this.useViewportQuad = true;

        this.visible = false;

        // webgl buffers
        this._vertexBuffer = null;
        this._indexBuffer = null;

        // color and brightness are exposed through setters
        this._color = 0x4d4d59;
        this._colorRgba = [0.3, 0.3, 0.35, 0.8];

        // run the color setter
        if (color || color === 0) {
            this.color = color;
        }

        // run the brightness setter
        if (brightness || brightness === 0) {
            this.brightness = brightness;
        }

        this.diffuseTextureLocation = 1;
        this.normalsTextureLocation = 2;

        this.inited = false;
    }

    initShader(gl)
    {
        if (!gl) {
            return;
        }
    }

    initWebGLContext(gl)
    {

        // create the buffers
        this._vertexBuffer = gl.createBuffer();
        this._indexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }

    syncShader()
    {
        const shader = this.shader;

        shader.uniforms.uUseViewportQuad = this.useViewportQuad;

        shader.uniforms.uLightColor[0] = this._colorRgba[0];
        shader.uniforms.uLightColor[1] = this._colorRgba[1];
        shader.uniforms.uLightColor[2] = this._colorRgba[2];
        shader.uniforms.uLightColor[3] = this._colorRgba[3];

        shader.uniforms.uLightHeight = this.height;

        shader.uniforms.uLightFalloff[0] = this.falloff[0];
        shader.uniforms.uLightFalloff[1] = this.falloff[1];
        shader.uniforms.uLightFalloff[2] = this.falloff[2];
    }

    update(gl)
    {
        if (!this.inited) {
            this.initShader(gl);
            this.initWebGLContext(gl);
            this.inited = true;
        }
    }

    render(renderer, diffuseTexture, normalsTexture)
    {
        const shader = this.shader;
        const gl = renderer.gl;
        let tex;
        if (!this.needsUpdate)
        {
            // update vertex data
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

            // bind diffuse texture
            gl.activeTexture(gl.TEXTURE0 + this.diffuseTextureLocation);
            tex = diffuseTexture.baseTexture._glTextures[renderer.CONTEXT_UID];
            gl.bindTexture(gl.TEXTURE_2D, tex.texture);
            // bind normal texture
            gl.activeTexture(gl.TEXTURE0 + this.normalsTextureLocation);
            tex = normalsTexture.baseTexture._glTextures[renderer.CONTEXT_UID];
            gl.bindTexture(gl.TEXTURE_2D, tex.texture);
            // update indices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this.indices);
        }
        else
        {
            this.needsUpdate = false;

            // upload vertex data
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 0, 0);

            // bind diffuse texture
            gl.activeTexture(gl.TEXTURE1);
            tex = diffuseTexture.baseTexture._glTextures[renderer.CONTEXT_UID];
            gl.bindTexture(gl.TEXTURE_2D, tex.texture);

            // bind normal texture
            gl.activeTexture(gl.TEXTURE2);
            tex = normalsTexture.baseTexture._glTextures[renderer.CONTEXT_UID];
            gl.bindTexture(gl.TEXTURE_2D, tex.texture);

            // static upload of index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        }
    }

    get color()
    {
        return this._color;
    }

    set color(val)
    {
        this._color = val;
        core.utils.hex2rgb(val, this._colorRgba);
    }

    get brightness()
    {
        return this._colorRgba[3];
    }

    set brightness(val)
    {
        this._colorRgba[3] = val;
    }
}

Light.DRAW_MODES = {

};
