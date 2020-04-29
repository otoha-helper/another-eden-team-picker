/**
 *  jQuery canvas editor
 * Designed for Another eden team picker, used to draw canvas.
 * Copyrighted AlexWong
 */


(function ($) {
    'use strict';
    var $ = $ || window.$;

    $.fn.extend({
        canvasAdd: function () {
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
    });

    jQuery.fn.extend({
        downloadCanvas: function (eleId, filename) {
            function checkTarget_(element) {
                var downloadFilename = filename || jQuery(element).attr('download') || "team_member.jpg";
                var canvasTarget = eleId || jQuery(element).attr('canvas-target') || "canvas";

                if (!jQuery(element).attr('download')){
                    jQuery(element).attr("download",downloadFilename);
                }
                if (!jQuery(element).attr('canvas-target')){
                    jQuery(element).attr("canvas-target",canvasTarget);
                }

                var canvas = document.getElementById(canvasTarget);
                var image = canvas.toDataURL("image/jpg");
                return {'image':image, 'filename': downloadFilename};
            }
            return this.each(function () {
                var target = checkTarget_(this);
                jQuery(this).on("click", function () {
                    var link = document.createElement('a');
                    link.download = target.filename;
                    link.href = target.image;
                    link.click();
                });

            });
        }
    });


})(jQuery);