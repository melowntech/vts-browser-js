

var MapRenderSlots = function(map) {
    this.map = map;
    this.draw = map.draw;
    this.renderer = map.renderer;
    this.config = map.config;
    this.renderSlots = [];
};


MapRenderSlots.prototype.createRenderSlot = function(id, callback, enabled) {
    return { id:id,
        callback:callback,
        enabled : enabled
    };
};


MapRenderSlots.prototype.addRenderSlot = function(id, callback, enabled) {
    this.renderSlots.push(this.createRenderSlot(id, callback, enabled));
};


MapRenderSlots.prototype.getRenderSlotIndex = function(id) {
    return this.map.searchArrayIndexById(this.renderSlots, id); 
};


MapRenderSlots.prototype.checkRenderSlotId = function(id) {
    if (id == 'after-map-render') {
        return 'map'; 
    } else {
        return id;
    }
};


MapRenderSlots.prototype.moveRenderSlotBefore = function(whichId, whereId) {
    var from = this.getRenderSlotIndex(this.checkRenderSlotId(whichId));
    var to = this.getRenderSlotIndex(whereId);
    if (from != -1 && to != -1 && to != from-1) { 
        this.renderSlots.splice(to, 0, this.renderSlots.splice(from, 1)[0]);
    }
};


MapRenderSlots.prototype.moveRenderSlotAfter = function(whichId, whereId) {
    var from = this.getRenderSlotIndex(this.checkRenderSlotId(whichId));
    var to = this.getRenderSlotIndex(whereId);
    if (from != -1 && to != -1 && to != from+1) {
        to++; 
        this.renderSlots.splice(to, 0, this.renderSlots.splice(from, 1)[0]);
    }
};


MapRenderSlots.prototype.removeRenderSlot = function(id) {
    var index = this.getRenderSlotIndex(id);
    if (index != -1) {
        this.renderSlots.splice(index, 1);
    }
};


MapRenderSlots.prototype.setRenderSlotEnabled = function(id, state) {
    var index = this.getRenderSlotIndex(id);
    if (index != -1) {
        this.renderSlots[index].enabled = state;
    }
};


MapRenderSlots.prototype.getRenderSlotEnabled = function(id) {
    var index = this.getRenderSlotIndex(id);
    if (index != -1) {
        return this.renderSlots[index].enabled;
    }
    
    return false;
};


MapRenderSlots.prototype.processRenderSlots = function() {
    if (this.draw.drawChannel != 1) {
        this.renderer.gpu.setViewport(); //just in case
    }

    for (var i = 0, li = this.renderSlots.length; i < li; i++) {
        var slot = this.renderSlots[i];

        if (slot.enabled && slot.callback) {
            this.renderer.gpu.setState(this.draw.drawTileState);
            slot.callback(this.draw.drawChannelNames[this.draw.drawChannel]);
        }
    }
};


export default MapRenderSlots;

