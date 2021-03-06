import * as particles from '../particles';

export default class ParticleContainer extends particles.ParticleContainer
{

    // constructor()
    // {
    //     super();
    // }

    addChild(child)
    {
        child.parent = this;
        child.transform._parentID = -1;
        this.children.push(child);

        this._boundsID++;

        this.onChildrenChange(this.children.length - 1);

        return child;
    }

    addChildAt(child, index)
    {
        child.parent = this;
        child.transform._parentID = -1;
        this.children.splice(index, 0, child);

        this._boundsID++;

        this.onChildrenChange(index);

        return child;
    }

    swapChildren(child1, child2)
    {
        const index1 = this.children.indexOf(child1);
        const index2 = this.children.indexOf(child2);

        this.children[index1] = child2;
        this.children[index2] = child1;

        this.onChildrenChange(index1 < index2 ? index1 : index2);
    }

    swapChildrenAt(index1, index2)
    {
        const child1 = this.children[index1];
        const child2 = this.children[index2];

        this.children[index1] = child2;
        this.children[index2] = child1;

        this.onChildrenChange(index1 < index2 ? index1 : index2);
    }

    getChildIndex(child)
    {
        return this.children.indexOf(child);
    }

    setChildIndex(child, index)
    {
        const currentIndex = this.children.indexOf(child);

        this.children.splice(currentIndex, 1);
        this.children.splice(index, 0, child);

        this.onChildrenChange(index);
    }

    getChildAt(index)
    {
        return this.children[index];
    }

    removeChild(child)
    {
        const index = this.children.indexOf(child);

        if (index === -1)
        {
            return null;
        }

        child.parent = null;
        // child.transform._parentID = -1;
        this.children.splice(index, 1);

        this._boundsID++;

        this.onChildrenChange(index);

        return child;
    }

    removeChildAt(index)
    {
        const child = this.children[index];

        if (!child)
        {
            return null;
        }

        child.parent = null;
        // child.transform._parentID = -1;
        this.children.splice(index, 1);

        this._boundsID++;

        this.onChildrenChange(index);

        return child;
    }

    removeChildWithIndex(child, index)
    {
        child.parent = null;
        // child.transform._parentID = -1;
        this.children.splice(index, 1);

        this._boundsID++;

        this.onChildrenChange(index);

        return child;
    }

    removeChildren(beginIndex, endIndex)
    {
        const begin = beginIndex || 0;
        const end = typeof endIndex === 'number' ? endIndex : this.children.length;
        const range = end - begin;
        let removed;
        let i;

        if (range > 0 && range <= end)
        {
            removed = this.children.splice(begin, range);

            for (i = 0; i < removed.length; ++i)
            {
                removed[i].parent = null;
                // removed[i].transform._parentID = -1;
            }

            this._boundsID++;

            this.onChildrenChange(beginIndex);

            return removed;
        }
        else if (range === 0 && this.children.length === 0)
        {
            return [];
        }

        return null;
    }

}
