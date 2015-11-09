Melown.Roi.Pano.Tile = function(face_, position_, index_, lod_, url_) {
    this.face_ = face_;
    this.position_ = [position_[0], position_[1]];
    this.index_ = [index_[0], index_[1]];
    this.lod_ = lod_;
    this.children_ = [];
    this.resources_ = {
        url_ : url_,
        image_ : null,
        texture_ : null
    };
}

Melown.Roi.Pano.Tile.prototype.applendChild = function(tile_) {
    this.children_.push(tile_);
}

Melown.Roi.Pano.Tile.prototype.url = function() {
    return this.resources_.url_;
}

Melown.Roi.Pano.Tile.prototype.onImage = function(err, image) {

}

Melown.Roi.Pano.Tile.prototype.onTexture = function(err, texture) {

}

Melown.Roi.Pano.Tile.prototype.image = function(queue_, clb_) {
    if (this.resources_.image_ instanceof Image) {
        setTimeout(clb_(null, this), 0);
        return this.resources_.image_;
    }

    if (!queue_ instanceof Melown.Roi.LoadingQueue) {
        setTimeout(new Error('Image is not loaded and there is not passed queue to load'), null);
        return null;
    }

    queue_.enqueue(this.resources_.url_, Melown.Roi.LoadingQueue.Type.Image, 
    function(err_, image_) {
        if (image_ instanceof Image) {
            this.resources_.image_ = image;
        }
        clb(err_, image_);
    }.bind(this));
    return null;
}

Melown.Roi.Pano.Tile.prototype.texture_ = function(renderer_) {
    if (typeof this.resources_.texture_ === 'object' 
        && this.resources_.texture_ !== null) {
        return this.resources_.texture_;
    }
    if (!this.resources_.image_ instanceof Image 
        || renderer_ instanceof Melown.Core.Renderer) {
        return null;
    }

    this.resources_.texture_ = this.renderer_.createTexture(this.resources_.image_);
    return this.resources_.texture_;
}

/**
 * @enum {int}
 */
Melown.Roi.Pano.Tile.ReleaseLevel = {
    Image : 1,
    Texture : 2,
    Both : 3
}

Melown.Roi.Pano.Tile.prototype.release = function(level_, renderer_) {
    if (level_ === undefined) {
        level_ = Melown.Roi.Pano.Tile.ReleaseLevel.Both;
    }

    if (level_ & Melown.Roi.Pano.Tile.ReleaseLevel.Image) {
        delete this.resources_.image_;
        this.resources_.image_ = null;
    }

    if (level_ & Melown.Roi.Pano.Tile.ReleaseLevel.Texture) {
        if (!renderer_ instanceof Melown.Core.Renderer) {
            return;
        }
        if (!this.resources_.texture_ instanceof Melown.Core.GpuTexture) {
            return;
        }
        renderer_.removeResource(this.resources_.texture_);
        this.resources_.texture_ = null;
    }
}
