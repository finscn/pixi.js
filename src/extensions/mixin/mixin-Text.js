import * as core from '../../core';

const Sprite = core.Sprite;
const Text = core.Text;

/**
 * Renders simple text and updates it without some computations
 *
 * @param {boolean} recompute - Whether recompute line position
 * @private
 **/
Text.prototype.updateTextFast = function (recompute)
{
    const style = this._style;
    const text = this._text;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let linePositionX;
    let linePositionY;

    if (!this._linePositionX || recompute)
    {
        const xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;

        linePositionX = style.strokeThickness / 2 + style.padding + xShadowOffset;
        let width = this.context.measureText(text).width + (style.letterSpacing * (text.length - 1));

        width += style.strokeThickness;
        if (style.dropShadow)
        {
            width += style.dropShadowDistance;
        }
        const lineWidth = Math.ceil((width + (style.strokeThickness || 1)) * this.resolution);
        const maxLineWidth = lineWidth - style.padding * 2;

        if (style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidth;
        }
        else if (style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidth) / 2;
        }
        this._linePositionX = linePositionX;

        // this.canvas.width = Math.ceil((width + this.context.lineWidth) * this.resolution);
    }
    else
    {
        linePositionX = this._linePositionX;
    }

    if (!this._linePositionY || recompute)
    {
        const fontProperties = Text.calculateFontProperties(this._font);
        const yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;

        linePositionY = (style.strokeThickness / 2) + fontProperties.ascent + style.padding + yShadowOffset;
        this._linePositionY = linePositionY;

        // this.canvas.height = Math.ceil((height + (style.padding * 2)) * this.resolution);
    }
    else
    {
        linePositionY = this._linePositionY;
    }

    if (style.stroke && style.strokeThickness)
    {
        this.drawLetterSpacing(text, linePositionX, linePositionY, true);
    }

    if (style.fill)
    {
        this.drawLetterSpacing(text, linePositionX, linePositionY);
    }

    this._onTextureUpdate();
    this._texture.baseTexture.emit('update', this._texture.baseTexture);

    this.dirtyFast = false;
};

/**
 * Sets the text & do updateTextFast.
 *
 * @param {string} text - The value to set to.
 */
Text.prototype.setTextFast = function (text)
{
    text = String(text || ' ');

    if (this._text === text)
    {
        return;
    }
    this._text = text;
    this.dirtyFast = true;
};

/**
 * Renders the object using the WebGL renderer
 *
 * @param {PIXI.WebGLRenderer} renderer - The renderer
 */
Text.prototype.renderWebGL = function (renderer)
{
    if (this.resolution !== renderer.resolution)
    {
        this.resolution = renderer.resolution;
        this.dirty = true;
    }

    if (this.dirty)
    {
        this.updateText(true);
    }
    else if (this.dirtyFast)
    {
        this.updateTextFast();
    }

    // super.renderWebGL(renderer);
    Sprite.prototype.renderWebGL.call(this, renderer);
};
