
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

//OLD
Melown.Map.prototype.generateSurfaceSequence2 = function() {
    var view_ = this.currentView_;
    this.surfaceSequence_ = [];
    this.surfaceSequenceIndices_ = [];

    this.surfaceOnlySequence_ = [];

    var surfaces_ = [];
    
    for (var key_ in view_.surfaces_) {
        surfaces_.push(key_);
    }

    //sort surface by index
    do {
        var sorted_ = true;
        
        for (var i = 0, li = surfaces_.length - 1; i < li; i++) {
            var s1_ = this.getSurface(surfaces_[i]);
            var s2_ = this.getSurface(surfaces_[i+1]);
            
            if (s2_.index_ < s1_.index_) {
                var t = surfaces_[i];
                surfaces_[i] = surfaces_[i+1];
                surfaces_[i+1] = t;
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);
   
    var list_ = [];
    var maxShift_ = surfaces_.length;
    var combinations_ = 2 << (maxShift_-1);

    //loop all surface combinations
    //we use binary representation of number to
    //generate all combinations   
    for (var i = 1; i < combinations_; i++) {
        var surfaceCount_ = 0;
        var id_ = "";
        var id2_ = "";
        var id3_ = 0;

        //build id 
        //conver binary number "i" to id
        for (var j = 0; j < maxShift_; j++) {
            if (i & (1 << j)) {

                if (surfaceCount_) {
                    id_ += ";" + surfaces_[j];    
                    id2_ = (j) + "." + id2_;    
                } else {
                    id_ = surfaces_[j];    
                    id2_ = "" + (j);
                    id3_ = j;    
                }

                surfaceCount_++;
            }
        }
        
        //if id exists then put it on the list 
        if (surfaceCount_ > 1) { //glue
            var glue_ = this.glues_[id_];
            if (glue_ != null) {
                list_.push([id2_, glue_, false]);
            }
        } else { //surface 
            list_.push([id2_, this.getSurface(id_), true, id3_]);
        }
    }

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

    var lastIndex_ = surfaces_.length - 1;

    //convert list to surface sequence
    for (var i = 0, li = list_.length; i < li; i++) {
        this.surfaceSequence_.push(list_[i][1]);
        
        //var viewSurfaceIndex_ = lastIndex_;// + ((lastIndex_ > 0) ? 1 : 0);
        
        list_[i][1].viewSurfaceIndex_ = lastIndex_; 
        
        if (list_[i][2]) {
            //this.surfaceSequenceIndices_[list_[i][3]] = lastIndex_;
            lastIndex_--;
            //lastIndex_ = i;
            
            this.surfaceOnlySequence_.push(list_[i][1]);
        }
    }
    
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
