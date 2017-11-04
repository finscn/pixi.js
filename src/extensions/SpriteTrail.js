import * as core from '../core';
// import * as mesh from '../mesh';

// const Texture = core.Texture;
const Container = core.Container;
const Sprite = core.Sprite;

/* eslint-disable require-jsdoc */

export default class SpriteTrail
{

    constructor(size)
    {
        size = size || 10;

        this.size = size;
        this.list = [];

        this.container = new Container();

        for (let i = 0; i < size; i++)
        {
            const sprite = new Sprite();

            this.container.addChild(sprite);
            this.list.push(sprite);
        }

        this.point = 0;

        this.disabled = false;

        this.tint = null;
        this.alpha = null;
    }

    reset()
    {
        this.point = 0;
    }

    takeSnapshot(sprite, alpha, tint, colorMultiplier)
    {
        if (this.disabled)
        {
            return null;
        }

        let snapshot;

        if (this.point === this.size)
        {
            this.point = this.size - 1;
            snapshot = this.list.shift();
            this.list.push(snapshot);
            this.container.children.shift();
            this.container.addChild(snapshot);
        }
        else
        {
            snapshot = this.list[this.point];
        }

        // const snapshot = new Sprite(sprite._texture);
        snapshot.texture = sprite._texture;
        snapshot.visible = true;
        snapshot.anchor.set(sprite.anchor.x, sprite.anchor.y);
        snapshot.pivot.set(sprite.pivot.x, sprite.pivot.y);
        snapshot.scale.set(sprite.scale.x, sprite.scale.y);
        snapshot.position.set(sprite.position.x, sprite.position.y);
        snapshot.rotation = sprite.rotation;

        if (alpha)
        {
            snapshot.alpha = alpha * sprite.alpha;
        }

        if (tint)
        {
            snapshot.tint = tint;
        }

        if (colorMultiplier || colorMultiplier === 0)
        {
            snapshot.colorMultiplier = colorMultiplier;
        }

        this.point++;

        return snapshot;
    }

    setParent(parentContainer)
    {
        parentContainer.addChild(this.container);
    }

    remove()
    {
        this.container.remove();
    }

    update(timeStep)
    {
        if (this.disabled || !this.updateSnapshot)
        {
            return;
        }

        for (let index = 0; index < this.point; ++index)
        {
            const snapshot = this.list[index];

            this.updateSnapshot(snapshot, index, timeStep);
        }
    }
}

/* eslint-enable require-jsdoc */
