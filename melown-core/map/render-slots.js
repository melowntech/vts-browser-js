
Melown.Map.prototype.createRenderSlot = function(id_, callback_, enabled_) {
    return { id:id_,
             callback_:callback_,
             enabled_ : enabled_
           };
};

Melown.Map.prototype.addRenderSlot = function(id_, callback_, enabled_) {
    this.renderSlots_.push(this.createRenderSlot(id_, callback_, enabled_));
};

Melown.Map.prototype.getRenderSlotIndex = function(id_) {
    return this.searchArrayIndexById(this.renderSlots_, id_); 
};

Melown.Map.prototype.moveRenderSlotBefore = function(whichId_, whereId_) {
    var from_ = this.getRenderSlotIndex(whichId_);
    var to_ = this.getRenderSlotIndex(whereId_);
    if (from_ != -1 && to_ != -1) { 
        this.renderSlots_.splice(to_, 0, this.splice(from_, 1)[0]);
    }
};

Melown.Map.prototype.addRenderSlotAfter = function(whichId_, whereId_) {
    var from_ = this.getRenderSlotIndex(whichId_);
    var to_ = this.getRenderSlotIndex(whereId_);
    if (from_ != -1 && to_ != -1) {
        to_++; 
        this.renderSlots_.splice(to_, 0, this.splice(from_, 1)[0]);
    }
};

Melown.Map.prototype.removeRenderSlot = function(id_) {
    var index_ = this.getRenderSlotIndex(id2_);
    if (index_ != -1) {
        this.renderSlots_.splice(index_, 1);
    }
};

Melown.Map.prototype.setRenderSlotEnabled = function(id_, state_) {
    var index_ = this.getRenderSlotIndex(id_);
    if (index_ != -1) {
        this.renderSlots_[index_].enabled_ = state_;
    }
};

Melown.Map.prototype.getRenderSlotEnabled = function(id_) {
    var index_ = this.getRenderSlotIndex(id2_);
    if (index_ != -1) {
        return this.renderSlots_[index_].enabled_;
    }
    
    return false;
};

Melown.Map.prototype.processRenderSlots = function(id_, callback_) {
    this.renderer_.gpu_.setViewport(); //just in case

    for (var i = 0, li = this.renderSlots_.length; i < li; i++) {
        var slot_ = this.renderSlots_[i];

        if (slot_.enabled_ && slot_.callback_) {
            slot_.callback_();
        }
    }
};


