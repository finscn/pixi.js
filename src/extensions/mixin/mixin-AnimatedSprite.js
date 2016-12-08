import * as extras from '../../extras';

const AnimatedSprite = extras.AnimatedSprite;

/**
 * Plays the AnimatedSprite
 * Don't add to core.ticker.shared.
 */
AnimatedSprite.prototype.play = function()
{
    this.playing = true;
};

AnimatedSprite.prototype.stop = function()
{
    this.playing = false;
};
