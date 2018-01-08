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
    const canvas = this.canvas;
    const context = this.context;

    if (!this._textInited)
    {
        this._font = this._style.toFontString();
        this._fontProperties = TextMetrics.measureFont(this._font);

        if (!this.canvasWidth)
        {
            const measured = TextMetrics.measureText(text, style, style.wordWrap, canvas);
            const width = measured.width;
            const height = measured.height;

            this.canvasWidth = Math.ceil(width + (style.padding * 2));
            this.canvasHeight = Math.ceil(height + (style.padding * 2));
        }

        canvas.width = this.canvasWidth * this.resolution;
        canvas.height = this.canvasHeight * this.resolution;

        context.scale(this.resolution, this.resolution);

        context.font = this._font;
        context.strokeStyle = style.stroke;
        context.lineWidth = style.strokeThickness;
        context.textBaseline = style.textBaseline;
        context.lineJoin = style.lineJoin;
        context.miterLimit = style.miterLimit;

        this._textInited = true;
    }
    else
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    let linePositionX;
    let linePositionY;

    if (!this._linePositionX || refreshPosition)
    {
        // const xShadowOffset = Math.cos(style.dropShadowAngle) * style.dropShadowDistance;
        const maxLineWidth = this.canvasWidth;
        let lineWidth = context.measureText(text).width + (style.letterSpacing * (text.length - 1));

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
        const fontProperties = this._fontProperties;

        linePositionY = (style.strokeThickness / 2) + fontProperties.ascent + style.padding;
        this._linePositionY = linePositionY;
    }
    else
    {
        linePositionY = this._linePositionY;
    }

    if (style.dropShadow)
    {
        context.shadowBlur = style._dropShadowBlur;
        context.shadowColor = style._dropShadowColor;

        context.shadowOffsetX = style._dropShadowOffsetX;
        context.shadowOffsetY = style._dropShadowOffsetY;
    }

    if (style.stroke && style.strokeThickness)
    {
        this.drawLetterSpacing(text, linePositionX, linePositionY, true);

        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }

    if (style.fill)
    {
        context.fillStyle = style.fill;

        this.drawLetterSpacing(text, linePositionX, linePositionY);
    }

    this.updateTexture();
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

Text.prototype.refresh = function ()
{
    this._textInited = false;
    this._linePositionX = 0;
    this._linePositionY = 0;
};

Text.prototype.simpleMode = false;
Text.prototype.refreshPosition = false;
