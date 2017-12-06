

var MapCache = function(map, maxCost) {
    this.map = map;
    this.maxCost = (maxCost != null) ? maxCost : Number.MAX_VALUE;
    this.skipCostCheck = false;
    this.last = null;
    this.first = null;

    this.totalCost = 0;
    this.totalItems = 0;
};


MapCache.prototype.updateItem = function(item) {
    if (item == null) {
        return;
    }

    if (this.first == item) {
        return;
    }

    //remove item from list
    if (item.prev != null) {
        item.prev.next = item.next;
    }

    if (item.next != null) {
        item.next.prev = item.prev;
    }

    if (this.last == item) {
        this.last = item.prev;
    }

    var first = this.first;

    //add item as first
    this.first = item;
    this.first.next = first;
    this.first.prev = null;

    first.prev = this.first;
};


MapCache.prototype.getMaxCost = function() {
    return this.maxCost;
};


MapCache.prototype.setMaxCost = function(cost) {
    this.maxCost = cost;
    this.checkCost();
};


MapCache.prototype.clear = function() {
    var item = this.first;

    while (item != null) {
        if (item.destructor != null) {
            item.destructor();
        }
        item = item.next;
    }

    this.last = null;
    this.first = null;

    this.totalCost = 0;
    this.totalItems = 0;
};


MapCache.prototype.insert = function(destructor, cost) {
    this.totalItems++;

    //console.log("insert: " + hash + " items: " + this.totalItems);

    var item = { destructor:destructor, cost:cost, prev: null, next:this.first };

    if (this.first != null) {
        this.first.prev = item;
    }

    //add item as first in list
    this.first = item;

    if (this.last == null) {
        this.last = item;
    }

    this.totalCost += cost;

    //console.log("MapCache.prototype.insert:" + this.totalCost + " / " + this.maxCost);

    this.checkCost();

    return item;
};


MapCache.prototype.remove = function(item) {
    this.totalItems++;
    var hit = false;

    if (item == this.first) {
        this.first = item.next;
        hit = true;

        if (this.first != null) {
            this.first.prev = null;
        }
    }

    if (item == this.last) {
        this.last = item.prev;
        hit = true;

        if (this.last != null) {
            this.last.next = null;
        }
    }

    if (!hit) {
    //if (item != this.last && item != this.first) {

        if (!item.prev) {
            //debugger;
        } else {
            item.prev.next = item.next;
        }
        
        if (!item.next) {
            //debugger;
        } else {
            item.next.prev = item.prev;
        }
        
    }

    this.totalCost -= item.cost;

    //destroy item
    item.destructor();

    //console.log("MapCache.prototype.remove:" + this.totalCost + " / " + this.maxCost);

    this.checkCost();
};


MapCache.prototype.checkCost = function() {
    if (this.skipCostCheck) {
        return;
    }

    while (this.totalCost > this.maxCost) {

        this.totalItems--;

        //console.log("remove: " + this.last.hash + " prev: " + this.last.prev + " items: " + this.totalItems);

        var last = this.last;

        if (last != null) {
            //set new last
            this.last = this.last.prev;

            if (this.last != null) {
                this.last.next = null;
            }

            this.totalCost -= last.cost;

            //destroy item
            last.destructor();

        } else {
            break;
        }
    }
};


MapCache.prototype.addItem = function(cost, destructor) {
    return this.insert(destructor, cost);
};


MapCache.prototype.removeItem = function(item) {
    return this.remove(item);
};


MapCache.prototype.itemUsed = function(item) {
    return this.updateItem(item);
};

/*
MapCache.prototype["addItem"] = MapCache.prototype.addItem;
MapCache.prototype["removeItem"] = MapCache.prototype.removeItem;
MapCache.prototype["itemUsed"] = MapCache.prototype.itemUsed;
*/

export default MapCache;