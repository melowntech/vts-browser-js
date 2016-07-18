
Melown.Map.prototype.generateSurfaceSequence = function(tree_, surfaces_) {
    var view_ = this.currentView_;
    var tree_ = this.tree_;
    
    if (!tree_) {
        return;
    }
    
    tree_.surfaceSequence_ = [];
    tree_.surfaceSequenceIndices_ = []; //probably not used
    tree_.surfaceOnlySequence_ = [];

    var vsurfaces_ = {}; 
    var vsurfaceCount_ = 0;
    var list_ = [];
        
    //add surfaces to the list
    for (var key_ in view_.surfaces_) {
        var surface_ = this.getSurface(key_);
        
        if (surface_) {
            vsurfaceCount_++;
            vsurfaces_[key_] = surface_.index_ + 1; //add one to avoid zero 
            //list_.push(["" + (surface_.index_ + 1), surface_, true]);    
            list_.push([ [(surface_.index_ + 1)], surface_, true, false]); //[surfaceId, surface, isSurface, isAlien]    
        }
    }

    //debugger;
    
    var glues_ = [];

    //add proper glues to the list
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
                //var listId_ = "";
                var listId_ = [];
                
                //create glue id in reverse order for sorting
                for (var j = 0, lj = id_.length; j < lj; j++) {
                    //listId_ = vsurfaces_[id_[j]] + (j ? "." : "") + listId_;
                    listId_.unshift(vsurfaces_[id_[j]]);
                }

                glues_.push([listId_, glue_, false, false]); //[surfaceId, surface, isSurface, isAlien]   
            }
        }
    }

    //process glue flags
    for (var i = 0, li = glues_.length; i < li; i++) {
        var item_ = glues_[i];
        var glue_ = item_[1];

        glue_.flagProper_ = true;
        glue_.flagAlien_ = true;

        if (glue_.flagProper_) {
            list_.push(item_);  
        }
                
        if (glue_.flagAlien_) {
            //remove first surface from id
            var listId_ = item_[0].slice(1);
                        
            //add same glue as alien
            list_.push([listId_, item_[1], false, true]); //[surfaceId, surface, isSurface, isAlien]   
        }
    }

    //debugger;

    //sort list alphabetically
    do {
        var sorted_ = true;
        
        for (var i = 0, li = list_.length - 1; i < li; i++) {
            var a1 = list_[i][0];
            var a2 = list_[i+1][0];
            
            var lesser_ = false;
            
            for (var j = 0, lj = Math.min(a1.length, a2.length); j < lj; j++) {
                if (a1[j] < a2[j] || (j == (lj -1) && a1[j] == a2[j] && a2.length > a1.length)) {
                    lesser_ = true;
                    break;                    
                }
            }
            
            if (lesser_) {
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
        tree_.surfaceSequence_.push([list_[i][1], list_[i][3]]); //[surface, isAlien]
        //this.surfaceSequence_.push(list_[i][1]); 
        list_[i][1].viewSurfaceIndex_ = lastIndex_; 
        
        if (list_[i][2]) {
            lastIndex_--;
            tree_.surfaceOnlySequence_.push(list_[i][1]);
        }
    }

    //this.generateSurfaceSequenceOld();

    //free layers
    for (var key_ in view_.freeLayers_) {
        var freeLayer_ = this.getFreeLayer(key_);
        freeLayer_.surfaceSequence_ = [freeLayer_];
        freeLayer_.surfaceOnlySequence_ = [freeLayer_];
    }    
};

Melown.Map.prototype.generateBoundLayerSequence = function() {
    var view_ = this.currentView_;
    var surfaces_ = [];
    
    //surfaces
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

    //free layers
    for (var key_ in view_.freeLayers_) {
        var freeLayersProperties_ = view_.freeLayers_[key_];
        var freeLayer_ = this.getFreeLayer(key_);
        if (freeLayer_ != null && freeLayer_.ready_) {
            freeLayer_.boundLayerSequence_ = [];
            
            var boundLayers_ = freeLayersProperties_["boundLayers"];
            
            if (boundLayers_ && Array.isArray(boundLayers_)) {

                for (var i = 0, li = boundLayers_.length; i < li; i++) {
                    var item_ = boundLayers_[i];
            
                    if (typeof item_ === "string") {
                        var layer_ = this.getBoundLayerById(item_);
                        if (layer_) {
                            freeLayer_.boundLayerSequence_.push([layer_, 1]);
                        }
                    } else {
                        var layer_ = this.getBoundLayerById(item_["id"]);
                        if (layer_) {
    
                            var alpha_ = 1;
                            if (typeof item_["alpha"] !== "undefined") {
                                alpha_ = item_["alpha"];
                            }
    
                            freeLayer_.boundLayerSequence_.push([layer_, alpha_]);
                        }
                    }
                }

                
            }
            
        }
    }

};



