/**
 * @constructor
 */
Melown.MapStats = function(map_)
{
    this.map_ = map_;
    this.drawnTiles_ = 0;
    this.counter_ = 0;
    this.statsCycle_ = 0;
    this.fps_ = 0;
    this.renderTime_ = 0;
    this.renderTimeTmp_ = 0;
    this.renderTimeBegin_ = 0;
};

Melown.MapStats.prototype.begin = function() {
    this.drawnTiles_ = 0;
    this.counter_++;
    this.statsCycle_++;

    this.renderTimeBegin_ = performance.now();

};

Melown.MapStats.prototype.end = function() {

    if (this.statsCycle_ > 100) {
        this.renderTime_ = this.renderTimeTmp_ / this.statsCycle_;
        this.fps_ = 1000 / this.renderTime_;
        this.statsCycle_ = 0;
        this.renderTimeTmp_ = 0;
    }

    var renderTime_ = performance.now() - this.renderTimeBegin_;

    this.renderTimeTmp_ += renderTime_;

    var timer_ = performance.now();// Date.now();
};


