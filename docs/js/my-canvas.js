/**
 *  jQuery canvas editor
 * Designed for Another eden team picker, used to draw canvas.
 * Copyrighted AlexWong
 */


(function ($) {
    'use strict';

    $.fn.extend({
        html2canvas: function(startCallback, doneCallback, errorCallback, scaleOption){
            var element = $(this).get(0);
            var myScaleOption = scaleOption || 0.7;
            if(element){
                html2canvas(element, {
                    scale: myScaleOption,
                    onclone: function () {
                        if (startCallback !== undefined && typeof startCallback === "function") startCallback(element);
                    }
                }).then(function (canvas) {
                    if (doneCallback !== undefined && typeof doneCallback === "function") {
                        doneCallback(canvas, element);
                    }else{
                        $(element).html(canvas);
                    }
                });
            }else{
                if (errorCallback !== undefined && typeof errorCallback === "function") errorCallback();
            }
        },
        canvas: {
            element: this,
            add: {
                rect: function () {
                    var canvas = $(this).get(0);
                    var ctx = canvas.getContext("2d");
                    var ox = canvas.width / 2;
                    var oy = canvas.height / 2;
                    ctx.beginPath();
                    ctx.font = "42px serif";
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top"; //middle
                    ctx.fillStyle = "#d9ce8c";
                    ctx.fillRect(0, 0, 150, 150);
                }
            },
            setHeight: function (height) {
                $(this).attr('height',height);
            },
            setWidth: function (width) {
                $(this).attr('width',width);
            },
            size: function (height, width) {
                if (typeof height == 'number' && typeof width  == 'number'){

                }
                this.setHeight(height);
                this.setWidth(width);
                return this;
            }
        }
    });

    $.fn.extend({
        downloadCanvas: function (eleId, filename) {
            function checkTarget_(element) {
                var downloadFilename = filename || $(element).data('download') || "team_member_" + (new Date().getTime()) + ".png";
                var canvasTarget = eleId || $(element).data('canvas-target') || "canvas";

                if (!$(element).data('download')){
                    $(element).data("download",downloadFilename);
                }
                if (!$(element).data('canvas-target')){
                    $(element).data("canvas-target",canvasTarget);
                }

                var canvas = document.getElementById(canvasTarget);
                var image = canvas.toDataURL("image/png");
                return {'image':image, 'filename': downloadFilename};
            }
            return this.each(function () {
                var target = checkTarget_(this);
                var btn = $(this);
                $(this).unbind( "click" );
                $(this).on("click", function () {
                    $(this).buttonLoading("loading");
                    setTimeout(function () {
                        $(btn).buttonLoading("reset");
                    }, 1000);
                    var link = document.createElement('a');
                    link.download = target.filename;
                    link.href = target.image;
                    link.click();
                });

            });
        },
        buttonLoading: function (action) {
            var loadingText = this.data('loading-text') || "<i class='fas fa-circle-notch fa-spin'></i>";
            if (action === 'loading') {
                this.data('original-text', this.html()).html(loadingText).prop('disabled', true);
            }
            if (action === 'reset' && this.data('original-text')) {
                this.html(this.data('original-text')).prop('disabled', false);
            }
        }
    });


})(jQuery);