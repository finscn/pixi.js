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
        this._font = style.toFontString();
        this._fontProperties = TextMetrics.measureFont(this._font);

        if (!this.canvasWidth)
        {
            const measured = TextMetrics.measureText(text, style, style._wordWrap, canvas);
            const width = measured.width;
            const height = measured.height;

            this.canvasWidth = Math.ceil(width + (style._padding * 2));
            this.canvasHeight = Math.ceil(height + (style._padding * 2));
        }

        canvas.width = this.canvasWidth * this.resolution;
        canvas.height = this.canvasHeight * this.resolution;

        context.scale(this.resolution, this.resolution);

        context.font = this._font;
        context.strokeStyle = style._stroke;
        context.lineWidth = style._strokeThickness;
        context.textBaseline = style._textBaseline;
        context.lineJoin = style._lineJoin;
        context.miterLimit = style._miterLimit;

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
        const maxLineWidth = this.canvasWidth;
        let lineWidth = context.measureText(text).width + (style._letterSpacing * (text.length - 1));

        lineWidth += style._padding * 2 + style._strokeThickness;

        if (style._dropShadow)
        {
            lineWidth += style._dropShadowDistance;
        }

        linePositionX = style._strokeThickness / 2 + style._padding;

        if (style._align === 'right')
        {
            linePositionX += maxLineWidth - lineWidth;
        }
        else if (style._align === 'center')
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
        const fontProperties = this._fontProperties;

        linePositionY = (style._strokeThickness / 2) + fontProperties.ascent + style._padding;
        this._linePositionY = linePositionY;
    }
    else
    {
        linePositionY = this._linePositionY;
    }

    if (style._dropShadow)
    {
        context.shadowBlur = style._dropShadowBlur;
        context.shadowColor = style._dropShadowColor;

        context.shadowOffsetX = style._dropShadowOffsetX;
        context.shadowOffsetY = style._dropShadowOffsetY;
    }

    if (style._stroke && style._strokeThickness)
    {
        this.drawLetterSpacing(text, linePositionX, linePositionY, true);

        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }

    if (style._fill)
    {
        context.fillStyle = style._fill;

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
