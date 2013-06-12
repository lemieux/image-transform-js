(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define([
                'jquery',
                'raphael'
        ], factory);
    } else {
        factory(window.jQuery, window.Raphael);
    }
}(function($, Raphael) {

    $.fn.imageTransform = function(options) {
        init.call(this, options);
        return this;
    };

    function init(opts) {
        var self = this;
        self.transform = new Transform(self, opts);
    }

    function Transform(target, opts) {
        var initTransform,
            initTarget,
            initCrop,
            drawCropTool,
            drawHandle,
            rotate,
            paper,
            image,
            realTarget,
            originalTarget = target,
            targetIsImage = $(target).is('img'),
            self = this,
            $self = $(self),
            naturalWidth = 0,
            naturalHeight = 0,
            originalWidth = 0,
            originalHeight = 0,
            centerX = 0,
            centerY = 0,
            container = document.createElement('div'),
            options = $.extend({
                containerHeight: '100%',
                containerWidth: '100%',
                cropstart: $.noop,
                cropstop: $.noop,
                destroy: $.noop,
                init: $.noop,
                rotatestart: $.noop,
                rotatestop: $.noop,
                src: $(target).attr('src'),
                viewBoxHeight: $(target).height(),
                viewBoxWidth: $(target).width(),
                cropHandleColor: '#fff',
                cropHandleSize: 5,
                cropBoxColor: '#000',
                rotationAnimation: 500,
                boxBgColor: '#4a525a'
            }, opts);
        /*
        var p = paper.setFinish(),
            newTX = 0,
            newTY = 0,
            fDx = 0,
            fDy = 0,
            tAddX, tAddY, reInitialize = false,
            start = function() {

            },
            move = function(dx, dy) {
                tAddX = dx - fDx, tAddY = dy - fDy, fDx = dx, fDy = dy;
                if (reInitialize) {
                    tAddX = 0, fDx = 0, tAddY = 0;
                    fDy = 0, reInitialize = false;
                } else {
                    newTX += tAddX, newTY += tAddY;
                    p.attr({
                        transform: "t" + newTX + "," + newTY
                    });
                }

            },
            up = function() {
                reInitialize = true;
            };
        p.drag(move, start, up);

*/
        initTransform = function() {

            if (typeof options.src === 'undefined' || options.src === false) {
                throw "No src given!";
            }

            self.target = realTarget;
            self.img = realTarget[0];

            naturalWidth = self.img.naturalWidth;
            naturalHeight = self.img.naturalHeight;

            originalWidth = self.img.width;
            originalHeight = self.img.height;

            centerX = originalWidth / 2;
            centerY = originalHeight / 2;

            $(self.target).hide();
            $(self.target).after(container);

            $self.on('cropstart', options.cropstart);
            $self.on('cropstop', options.cropstop);
            $self.on('destroy', options.destroy);
            $self.on('init', options.init);
            $self.on('rotatestart', options.rotatestart);
            $self.on('rotatestop', options.rotatestop);



            initTarget = function() {
                paper = Raphael(container, options.containerWidth, options.containerHeight);
                paper.rect(0, 0, options.containerWidth, options.containerHeight).attr({
                    fill: options.boxBgColor
                });
                paper.setViewBox(0, 0, options.viewBoxWidth, options.viewBoxHeight, true);
                image = paper.image(options.src, 0, 0, originalWidth, originalHeight);
            };

            initCrop = function() {
                var cropButton = paper.rect(10, centerY, 50, 50, 10);
                cropButton.attr({
                    'fill': options.boxBgColor,
                    'fill-opacity': 0.5,
                    'title': 'Crop'
                });

                var cropButtonSet = paper.set();
                cropButtonSet.push(cropButton);

                var cropIcon = drawCropTool(22.5, centerY + 12.5, 25, 25, options.cropHandleSize, options.cropHandleColor, options.cropBoxColor);
                cropButtonSet.push(cropIcon);

                cropButtonSet.mouseover(function() {
                    cropButtonSet.attr('fill-opacity', 1);
                }).mouseout(function() {
                    cropButtonSet.attr('fill-opacity', 0.5);
                });

            };

            drawHandle = function(x, y, width, height, color) {
                return paper.rect(x, y, width, height).attr({
                    stroke: color,
                    fill: color,
                    'fill-opacity': 0.5
                });
            };

            drawCropTool = function(x, y, width, height, handleSize, handleColor, boxColor) {
                var set = paper.set();

                var box = paper.rect(x, y, width, height).attr({
                    'stroke-dasharray': ['-'],
                    'stroke': boxColor
                });

                var handleOffset = handleSize / 2;
                var centerX = width / 2;
                var centerY = height / 2;

                var nw = drawHandle(x - handleOffset, y - handleOffset, handleSize, handleSize, handleColor);
                var n = drawHandle(x + centerX - handleOffset, y - handleOffset, handleSize, handleSize, handleColor);
                var ne = drawHandle(x + width - handleOffset, y - handleOffset, handleSize, handleSize, handleColor);
                var w = drawHandle(x - handleOffset, y + centerY - handleOffset, handleSize, handleSize, handleColor);
                var e = drawHandle(x + width - handleOffset, y + centerY - handleOffset, handleSize, handleSize, handleColor);
                var sw = drawHandle(x - handleOffset, y + height - handleOffset, handleSize, handleSize, handleColor);
                var s = drawHandle(x + centerX - handleOffset, y + height - handleOffset, handleSize, handleSize, handleColor);
                var se = drawHandle(x + width - handleOffset, y + height - handleOffset, handleSize, handleSize, handleColor);


                set.push(box);
                set.push(nw);
                set.push(n);
                set.push(ne);
                set.push(w);
                set.push(e);
                set.push(sw);
                set.push(s);
                set.push(se);

                return set;
            };

            rotate = function(angle) {
                $self.trigger('rotatestart');
                var radians, sint, cost, h1, h2, hh, ww;

                angle = angle < 0 ? 360 + angle : angle;

                if (angle <= 90) {
                    radians = Raphael.rad(angle);
                } else if (angle <= 180) {
                    radians = Raphael.rad(180 - angle);
                } else if (angle <= 270) {
                    radians = Raphael.rad(angle - 180);
                } else {
                    radians = Raphael.rad(360 - angle);
                }

                sint = Math.sin(radians);
                cost = Math.cos(radians);

                var height = originalHeight,
                    width = originalWidth;

                var verticalSpace = width * sint + height * cost;
                var horizontalSpace = width * cost + height * sint;


                var scaleX = width / horizontalSpace;
                var scaleY = height / verticalSpace;

                var scale = Math.min(scaleX, scaleY);

                if (options.rotationAnimation !== undefined && typeof options.rotationAnimation === "number") {
                    image.animate({
                        transform: "r" + angle + "s" + scale
                    },
                        options.rotationAnimation,
                        "<>", function() {
                        $self.trigger('rotatestop');
                    });
                } else {
                    image.transform("r" + angle + "s" + scale);
                    $self.trigger('rotatestop');
                }
            };


            initTarget();
            initCrop();

            realTarget.rotate = self.rotate = rotate;
            $self.trigger('init');
        };

        if (!targetIsImage && options.src) {
            var targetImg = new Image();
            targetImg.onLoad(function() {
                target.after(targetImg);
                target.hide();
                realTarget = targetImg;
                initTransform();
            });
            targetImg.src = options.src;
        } else {
            realTarget = target;
            initTransform();
        }

    }

    Transform.version = "0.0.1";

}));