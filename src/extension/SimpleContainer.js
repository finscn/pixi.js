import * as core from '../core';
const Container = core.Container;

function SimpleContainer() {
    Container.call(this);
}

export default SimpleContainer;

// constructor
SimpleContainer.prototype = Object.create(Container.prototype);
SimpleContainer.prototype.constructor = SimpleContainer;

Object.defineProperties(SimpleContainer.prototype, {

});

(function() {

    const funs = {
        addChild: function(child) {
            child.parent = this;
            // ensure a transform will be recalculated..
            this.transform._parentID = -1;
            this.children.push(child);
            // this.onChildrenChange(this.children.length - 1);
            return child;
        },

        addChildAt: function(child, index) {
            child.parent = this;
            this.children.splice(index, 0, child);
            // this.onChildrenChange(index);
            return child;
        },

        swapChildren: function(child1, child2) {
            const index1 = this.children.indexOf(child1);
            const index2 = this.children.indexOf(child2);

            this.children[index1] = child2;
            this.children[index2] = child1;

            // this.onChildrenChange(index1 < index2 ? index1 : index2);
        },

        swapChildrenAt: function(index1, index2) {
            const child1 = this.children[index1];
            const child2 = this.children[index2];

            this.children[index1] = child2;
            this.children[index2] = child1;

            // this.onChildrenChange(index1 < index2 ? index1 : index2);
        },

        getChildIndex: function(child) {
            return this.children.indexOf(child);
        },

        setChildIndex: function(child, index) {
            const currentIndex = this.children.indexOf(child);
            this.children.splice(currentIndex, 1);
            this.children.splice(index, 0, child);
            // this.onChildrenChange(index);
        },

        getChildAt: function(index) {
            return this.children[index];
        },

        removeChild: function(child) {
            const index = this.children.indexOf(child);
            if (index === -1) {
                return null;
            }
            child.parent = null;
            this.children.splice(index, 1);
            // this.onChildrenChange(index);
            return child;
        },

        removeChildAt: function(index) {
            const child = this.children[index];
            if (child) {
                child.parent = null;
                this.children.splice(index, 1);
                // this.onChildrenChange(index);
            }
            return child;
        },

        removeChildWithIndex: function(child, index) {
            child.parent = null;
            this.children.splice(index, 1);
            // this.onChildrenChange(index);
            return child;
        },

        removeChildren: function(beginIndex, endIndex) {
            const begin = beginIndex || 0;
            const end = typeof endIndex === 'number' ? endIndex : this.children.length;
            const range = end - begin;
            let removed;
            let i;

            if (range > 0 && range <= end) {
                removed = this.children.splice(begin, range);

                for (i = 0; i < removed.length; ++i) {
                    removed[i].parent = null;
                }

                // this.onChildrenChange(beginIndex);

                return removed;
            } else if (range === 0 && this.children.length === 0) {
                return [];
            }

            return null;
        },
    };

    for (const p in funs) {
        SimpleContainer.prototype[p] = funs[p];
    }

})();
