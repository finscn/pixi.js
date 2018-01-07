import * as core from '../../core';

const Sprite = core.Sprite;
const Text = core.Text;
const TextMetrics = core.TextMetrics;

/**
 * Renders simple text and updates it without some computations
 *
 * @param {boolean} refreshPosition - Whether refresh text's line position
 * @private
 **/
Text.prototype.updateTextSimple = function (refreshPosition)
{
    const style = this._style;
    const text = this._text;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let linePositionX;
    let linePositionY;

    if (!this._linePositionX || refreshPosition)
    {
        // const xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        const maxLineWidth = this.canvas.width;
        let lineWidth = this.context.measureText(text).width + (style.letterSpacing * (text.length - 1));

        lineWidth += style.padding * 2 + style.strokeThickness;

        if (style.dropShadow)
        {
            lineWidth += style.dropShadowDistance;
        }

        linePositionX = style.strokeThickness / 2 + style.padding;

        if (style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidth;
        }
        else if (style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidth) / 2;
        }
        this._linePositionX = linePositionX;
    }
    else
    {
        linePositionX = this._linePositionX;
    }

    if (!this._linePositionY || refreshPosition)
    {
        // const yShadowOffset = Math.sin(style.dropShadowAngle) * style.dropShadowDistance;
        const fontProperties = TextMetrics.measureFont(this._font);

        linePositionY = (style.strokeThickness / 2) + fontProperties.ascent + style.padding;
        this._linePositionY = linePositionY;
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
        this.context.fillStyle = style.fill;

        this.drawLetterSpacing(text, linePositionX, linePositionY);
    }

    this._onTextureUpdate();
    this._texture.baseTexture.emit('update', this._texture.baseTexture);

    this.dirty = false;
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

    if (this.localStyleID !== this._style.styleID)
    {
        this.localStyleID = this._style.styleID;
        this.dirty = true;
    }

    if (this.dirty)
    {
        if (this.simpleMode)
        {
            this.updateTextSimple(this.refreshPosition);
        }
        else
        {
            this.updateText(true);
        }
    }

    // super.renderWebGL(renderer);
    Sprite.prototype.renderWebGL.call(this, renderer);
};

Text.prototype.simpleMode = false;
Text.prototype.refreshPosition = false;
