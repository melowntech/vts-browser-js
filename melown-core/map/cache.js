/**
 * @constructor
 */
Melown.MapCache = function(map_, maxCost_) {
    this.map_ = map_;
    this.maxCost_ = (maxCost_ != null) ? maxCost_ : Number.MAX_VALUE;
    this.last_ = null;
    this.first_ = null;

    this.totalCost_ = 0;
    this.totalItems_ = 0;
};

Melown.MapCache.prototype.updateItem = function(item_) {
    if (item_ == null) {
        return;
    }

    if (this.first_ == item_) {
        return;
    }

    //remove item from list
    if (item_.prev_ != null) {
        item_.prev_.next_ = item_.next_;
    }

    if (item_.next_ != null) {
        item_.next_.prev_ = item_.prev_;
    }

    if (this.last_ == item_) {
        this.last_ = item_.prev_;
    }

    var first_ = this.first_;

    //add item as first
    this.first_ = item_;
    this.first_.next_ = first_;
    this.first_.prev_ = null;

    first_.prev_ = this.first_;
};

Melown.MapCache.prototype.getMaxCost = function() {
    return this.maxCost_;
};

Melown.MapCache.prototype.setMaxCost = function(cost_) {
    this.maxCost_ = cost_;
    this.checkCost();
};

Melown.MapCache.prototype.clear = function() {
    var item_ = this.first_;

    while (item_ != null) {
        if (item_.destructor_ != null) {
            item_.destructor_();
        }
        item_ = item_.next_;
    }

    this.last_ = null;
    this.first_ = null;

    this.totalCost_ = 0;
    this.totalItems_ = 0;
};

Melown.MapCache.prototype.insert = function(destructor_, cost_) {
    this.totalItems_++;

    //console.log("insert: " + hash_ + " items: " + this.totalItems_);

    var item_ = { destructor_:destructor_, cost_:cost_, prev_: null, next_:this.first_ };

    if (this.first_ != null) {
        this.first_.prev_ = item_;
    }

    //add item as first in list
    this.first_ = item_;

    if (this.last_ == null) {
        this.last_ = item_;
    }

    this.totalCost_ += cost_;

    //console.log("MapCache.prototype.insert:" + this.totalCost_ + " / " + this.maxCost_);

    this.checkCost();

    return item_;
};

Melown.MapCache.prototype.remove = function(item_) {
    this.totalItems_++;

    if (item_ == this.first_) {
        this.first_ = item_.next_;

        if (this.first_ != null) {
            this.first_.prev_ = null;
        }
    }

    if (item_ == this.last_) {
        this.last_ = item_.prev_;

        if (this.last_ != null) {
            this.last_.next_ = null;
        }
    }

    if (item_ != this.last_ && item_ != this.first_) {
        item_.prev_.next_ = item_.next_;
        
        //if (!item_.next_) {
          //  debugger;
        //}
        
        item_.next_.prev_ = item_.prev_;
    }

    this.totalCost_ -= item_.cost_;

    //destroy item
    item_.destructor_();

    //console.log("MapCache.prototype.remove:" + this.totalCost_ + " / " + this.maxCost_);

    this.checkCost();
};


Melown.MapCache.prototype.checkCost = function() {
    while (this.totalCost_ > this.maxCost_) {

        this.totalItems_--;

        //console.log("remove: " + this.last_.hash_ + " prev: " + this.last_.prev_ + " items: " + this.totalItems_);

        var last_ = this.last_;

        if (last_ != null) {
            //set new last
            this.last_ = this.last_.prev_;

            if (this.last_ != null) {
                this.last_.next_ = null;
            }

            this.totalCost_ -= last_.cost_;

            //destroy item
            last_.destructor_();

        } else {
            break;
        }
    }
};

