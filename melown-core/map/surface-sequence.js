
Melown.Map.prototype.generateSurfaceSequence = function() {
    var view_ = this.currentView_;
    this.surfaceSequence_ = [];
    this.surfaceSequenceIndices_ = []; //probably not used
    this.surfaceOnlySequence_ = [];

    var vsurfaces_ = {}; 
    var vsurfaceCount_ = 0;
    var list_ = [];
        
    //add surfaces to the list
    for (var key_ in view_.surfaces_) {
        var surface_ = this.getSurface(key_);
        
        if (surface_) {
            vsurfaceCount_++;
            vsurfaces_[key_] = surface_.index_ + 1; //add one to avoid zero 
            list_.push(["" + (surface_.index_ + 1), surface_, true]);    
        }
    }

    //add glues to the list
    for (var key_ in this.glues_) {
        var glue_ = this.glues_[key_];
        
        //add only glue which contains desired surfaces
        var id_ = glue_.id_; 
        if (id_.length <= vsurfaceCount_) {

            var missed_ = false;
            for (var j = 0, lj = id_.length; j < lj; j++) {
                if (!vsurfaces_[id_[j]]) {
                    missed_ = true;
                    break;
                }
            }

            if (!missed_) {
                var listId_ = "";
                
                //create glue id in reverse order for sorting
                for (var j = 0, lj = id_.length; j < lj; j++) {
                    listId_ = vsurfaces_[id_[j]] + (j ? "." : "") + listId_;
                }

                list_.push([listId_, glue_, false]);    
            }
        }
    }

    //debugger;

    //sort list alphabetically
    do {
        var sorted_ = true;
        
        for (var i = 0, li = list_.length - 1; i < li; i++) {
            if (list_[i][0] < list_[i+1][0]) {
                var t = list_[i];
                list_[i] = list_[i+1];
                list_[i+1] = t;
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);

    //debugger;

    //return;

    var lastIndex_ = vsurfaceCount_ - 1;

    //convert list to surface sequence
    for (var i = 0, li = list_.length; i < li; i++) {
        this.surfaceSequence_.push(list_[i][1]);
        list_[i][1].viewSurfaceIndex_ = lastIndex_; 
        
        if (list_[i][2]) {
            lastIndex_--;
            this.surfaceOnlySequence_.push(list_[i][1]);
        }
    }

//    this.generateSurfaceSequence2();
    
};


Melown.Map.prototype.generateBoundLayerSequence = function() {
    var view_ = this.currentView_;
    var surfaces_ = [];
    
    for (var key_ in view_.surfaces_) {
        var surfaceLayers_ = view_.surfaces_[key_];
        var surface_ = this.getSurface(key_);
        if (surface_ != null) {
            surface_.boundLayerSequence_ = [];
            
            for (var i = 0, li = surfaceLayers_.length; i < li; i++) {
                var item_ = surfaceLayers_[i];
        
                if (typeof item_ === "string") {
                    var layer_ = this.getBoundLayerById(item_);
                    if (layer_) {
                        surface_.boundLayerSequence_.push([layer_, 1]);
                    }
                } else {
                    var layer_ = this.getBoundLayerById(item_["id"]);
                    if (layer_) {

                        var alpha_ = 1;
                        if (typeof item_["alpha"] !== "undefined") {
                            alpha_ = item_["alpha"];
                        }

                        surface_.boundLayerSequence_.push([layer_, alpha_]);
                    }
                }
            }
        }
    }
};
