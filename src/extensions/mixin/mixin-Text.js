import * as core from '../../core';

const Sprite = core.Sprite;
const Text = core.Text;

/**
 * Renders simple text and updates it without some computations.
 *
 * @private
 **/
Text.prototype.updateTextFast = function ()
{
    /**
     * TODO: Work in progress.
     *       There are still some computations could be remove.
     */

    this.dirtyFast = false;
    const style = this._style;
    const text = this._text;
    const maxLineWidth = this.canvas.width - style.padding * 2;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this._textWidth)
    {
        this._textWidth = this.context.measureText(text).width + (style.letterSpacing * (text.length - 1));
    }
    const lineWidth = this._textWidth;

    if (!this._fontProperties)
    {
        this._fontProperties = Text.calculateFontProperties(this._font);
    }
    const fontProperties = this._fontProperties;

    let linePositionX = style.strokeThickness / 2;
    const linePositionY = (style.strokeThickness / 2) + fontProperties.ascent;

    if (style.align === 'right')
    {
        linePositionX += maxLineWidth - lineWidth;
    }
    else if (style.align === 'center')
    {
        linePositionX += (maxLineWidth - lineWidth) / 2;
    }

    if (style.stroke && style.strokeThickness)
    {
        this.drawLetterSpacing(text, linePositionX + style.padding, linePositionY + style.padding, true);
    }

    if (style.fill)
    {
        this.drawLetterSpacing(text, linePositionX + style.padding, linePositionY + style.padding);
    }
};

/**
 * Sets the text & do updateTextFast.
 *
 * @param {string} text - The value to set to.
 */
Text.prototype.setTextFast = function (text)
{
    text = text || ' ';
    text = text.toString();

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
