
Melown.Map.prototype.generateSurfaceSequence = function() {
    var view_ = this.currentView_;
    var surfaces_ = view_.surfaces_;
    this.surfaceSequence_ = [];
    this.surfaceSequenceIndices_ = [];
   
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

    var lastIndex_ = 0;

    //convert list to surface sequence
    for (var i = 0, li = list_.length; i < li; i++) {
        this.surfaceSequence_.push(list_[i][1]);
        
        if (list_[i][2]) {
            this.surfaceSequenceIndices_[list_[i][3]] = lastIndex_;
            lastIndex_ = i;
        }
    }
    
};


