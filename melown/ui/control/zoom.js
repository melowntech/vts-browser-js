/**
 * @constructor
 */
Melown.UIControlZoom = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("zoom",
      '<div id="melown-zoom"'
      + ' class="melown-zoom">'

        + '<img id="melown-zoom-plus"'
          + ' class="melown-zoom-plus"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTAyOUNBMDJCQjNCMTFFM0JDQjQ5NURBODEzRTcxRTkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTAyOUNBMDNCQjNCMTFFM0JDQjQ5NURBODEzRTcxRTkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MDI5Q0EwMEJCM0IxMUUzQkNCNDk1REE4MTNFNzFFOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5MDI5Q0EwMUJCM0IxMUUzQkNCNDk1REE4MTNFNzFFOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pul3mzIAAANGSURBVHja7FlLTxNRGJ0WpNJoDSILDQ9t5NG4w52QVowGF8Z/YDfqyo0/xY0rWeFfYKExAdvYpd2Z4WEaQKILfEQwlNbSeq6em0wmM7cznUeniSc5+RrozHf6zTf3zncm1mq1tF5DXOtB9KTofp9++CQ4DV4GR8ABMAHWwDq4D+6COvgRPJEHx2IxR0mMbRzz0NMZcB681sGxH8B34keEJToN3mOUlZ4CJ8AL4CDYB54Gj1nVKvgN3AY3wSaPrYArEF4JUvQD8Do/n2WlR8Gki3McgXus9CH/9h7CX/ot+gz4ELzCKi6wuqc83Au/wS1wlVdjB3wB8b/8ED0EPuGlvwgugud8XAx+gq/BL+BX8DmE//AiWrTAU3CYlb3JnvUbouffst9F7z+D8EM70e3W6UcUPAPeDkiwxvPeYZ5h5u1oc8lzRRAtkfPYv073jBzzTaCyebeixSYxy5tukctXGBB57jLvLISn3Yi+z7jg803nBCnm1bgfOBKd4caR4s3XDUwzfxrVzjgRPc94I4Q+VvX3HD9n24mO81lCxDEvWbPZ7F96wCh1ZFDtPpXoScYpl1tzEEiyTTRzm8Yt+lmuHlGA1DGjEj3OeD4ioocYx1SiRwyXJgpImnRZik74ONH4OVklVOPWgNWXVMjlctZPQNWq8v+FQsHJ6RMmXZaVrjPWIlLpmkmXZaVr/FUNp9W2q5hcox1W1A4NqyKaK71vGImigCOTLkvRu4zfIyJaTjCfVKJ1xu2IiJY61lWitxg3I9AiIv+GQY+t6Car3eSY303sST2YF0/a2WJFPoOU+Fzd0UZTLBa9rholg562z9M6nZ8Dw+UJGxvMX0GVdafj1grjGg8OEwfMa9ThSLSodJnOzyvtnycXBo6ZT+Qt23l8KgthmVaVcH4Kht0pKDSYR+TbgeDlTnwPgSU6PmKdfEMnKAhUef515ltSfdmtl3eJPkjK5x4WXt5nzScvT0K4po/pOIkh8xbntn6P7SA2jUBcUyPydJ6kqTKnde5PlwwrU1nVw15Fa5r9mwAxhArzcJBXQL5zaWhdfhNgntyzhgneDXTudHrYL4okRI9fpfhxDqEJDhN1Vjsyb7e6hv9vbMPCHwEGAPd0FDaYMbMfAAAAAElFTkSuQmCC">'

        + '<img id="melown-zoom-minus"'
          + ' class="melown-zoom-minus"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAtCAYAAAA6GuKaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OUREMDE5NURCQjNCMTFFMzhBQzJFQkIxMjY5Q0I0QjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OUREMDE5NUVCQjNCMTFFMzhBQzJFQkIxMjY5Q0I0QjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5REQwMTk1QkJCM0IxMUUzOEFDMkVCQjEyNjlDQjRCMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5REQwMTk1Q0JCM0IxMUUzOEFDMkVCQjEyNjlDQjRCMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhZ6YaAAAAMZSURBVHja7JlLTxRBEMeHVQ6Ie5BlwWgEA5hwwEAiiSNETIwnLnrzET+Bn8YPYXzc8MTFmCjB4O56INnDJoIRDZt1YPGwIAedWav0P9pMel47j56NVvJPTyY9U7/pVE93Vfe0222t2yyndaEdj+nDh0lDpAIpj/eyfkAtUpNkQGYUhz0RwuMMaYx0toNnt0kfSPW0oHlEp0hFYaRHSBNoT5H60KdKOiR9JX0ibaC18OwO+hhJQl8mncf1CdI8aZo0G+IdFdI6aZX0Dfc+kt7GDc0jN0caxMgukBYxsp0aj/gy6RVGvokPOYwD+iTpGlqGvk26GuPPYIX0jLRL2sdH7EeB5hC4TuonjZLuIRziNg6Xx6Qt0gHppRA6oaFv4DfGcfwgYjj4WYP0EPHNofKik8VFBzCHxP2EgdlOw88g/OphoYsIhxxieCqlxY793IXfUfxeA0NfRLsQ86QLYvPwq7kNVs5lpSti8i0q2l7cgv8ieHyhx9BeSSGOveJ7DtfjftA57CW4nVG8mZsGB4/0MS/oYbQjIZfmJGwWk1HkkkLbs3UiI1vnCw4uKXQB7bmMQNvb3gEv6Lysk0IbcHBJM5deWScf25TNcA/bEK79wjDv4JJC27N0MiiBrut/gC3LCvLIL9BSqRSk76SDSwptokMtKLhp/k73EsrqawKXK/R3QLeCvrVcLicZ0y2By3Ui2p32MjIR9xxcUugm2s8Zgd6WDaIT2pDMcJX23sElhf4iJJ0VxcAVpF8ilxTaQgHFQt6m0tYFHtNva7qJ9g3yNhXWgH+RxxO6jsoPZ8VLiqCX4H9Hk5TO3NKtKtrXKKCkaavwK3IEgjYwCTimnrg9nIBV4c+CfyNsCWEN/22u/DxKIb4b8LMLv2v/VIWJTazlcXZ8B2l+nDH8FJMullqebX0ALSCk+CNuImuOEg7PtYSqpke2z0Ky2Y80n7P2SyHe8U77W58+wL0trxiOCm0nmX4nAXnsx2vYoSk9CXBWosZlFaAAVsdKl9qZiyZJ0Ya0o6dbvbhvYgOfmdMtZdaVh5//odOynwIMAFn66fVJ7Ib5AAAAAElFTkSuQmCC">'

     + ' </div>', visible_);

    var plus_ = this.control_.getElement("melown-zoom-plus");
    plus_.on("click", this.onZoomIn.bind(this));

    var minus_ = this.control_.getElement("melown-zoom-minus");
    minus_.on("click", this.onZoomOut.bind(this));

};

Melown.UIControlZoom.prototype.onZoomIn = function() {
    this.repeat(7, 0.96, 50);
};

Melown.UIControlZoom.prototype.onZoomOut = function() {
    this.repeat(7, 1.04, 50);
};

Melown.UIControlZoom.prototype.repeat = function(count_, factor_, delay_) {
    if (count_ <= 0) {
        return;
    }

    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }
    
    var controller_ = this.browser_.controlMode_.getCurrentController();
    
    if (controller_.viewExtentDeltas_) {
        controller_.viewExtentDeltas_.push(factor_);
    }

    setTimeout(this.repeat.bind(this, --count_, factor_, delay_), delay_);
};


