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
            initCropCoords,
            drawCropTool,
            drawHandle,
            drawShadow,
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
            cropToolHidden = true,
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
                cropHandleSize: 15,
                cropBoxColor: '#000',
                rotationAnimation: 500,
                boxBgColor: '#4a525a',
                defaultCrop: undefined,
                cropRatio: 1,
                keepRatio: true
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

            initCropCoords = function() {
                // might need to interpolate it against the original image if the coords are given
                if (options.defaultCrop === undefined) {

                    var boxWidth,
                        boxHeight;

                    if (options.cropRatio !== undefined && typeof options.cropRatio === "number") {
                        boxWidth = originalWidth * 0.5;
                        boxHeight = boxWidth * options.cropRatio;
                    } else {
                        boxWidth = originalWidth * 0.5;
                        boxHeight = originalHeight * 0.5;
                    }

                    options.defaultCrop = {
                        x: centerX - boxWidth / 2,
                        y: centerY - boxHeight / 2,
                        width: boxWidth,
                        height: boxHeight
                    };
                }
                self.cropCoords = options.defaultCrop;
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

                var cropIcon = drawCropTool(22.5, centerY + 12.5, 25, 25, 7, options.cropHandleColor, options.cropBoxColor, false);
                cropButtonSet.push(cropIcon);


                var cropTool = drawCropTool(self.cropCoords.x,
                    self.cropCoords.y,
                    self.cropCoords.width,
                    self.cropCoords.height,
                    options.cropHandleSize,
                    options.cropHandleColor,
                    options.cropBoxColor, true);


                cropButtonSet.mouseover(function() {
                    cropButtonSet.attr('fill-opacity', 1);
                }).mouseout(function() {
                    cropButtonSet.attr('fill-opacity', 0.5);
                }).click(function() {
                    if (cropToolHidden) {
                        cropToolHidden = false;
                        cropTool.show();
                    } else {
                        cropToolHidden = true;
                        cropTool.hide();
                    }
                    cropButtonSet.toFront();
                });

                cropTool.hide();


            };

            drawHandle = function(x, y, width, height, color, name) {
                return paper.rect(x, y, width, height).attr({
                    stroke: color,
                    fill: color,
                    'fill-opacity': 0.5
                }).data('name', name);
            };

            drawShadow = function(x, y, width, height) {
                var set = paper.set();

                var top = paper.rect(x, 0, width, y).attr({
                    'fill': '#000',
                    'fill-opacity': 0.5,
                    'stroke-opacity' : 0.5,
                    'stroke-width': 0,
                    'stroke' : '#000'
                });
                var bottom = paper.rect(x, y + height, width, originalHeight - y - height).attr({
                    'fill': '#000',
                    'fill-opacity': 0.5,
                    'stroke-opacity' : 0.5,
                    'stroke-width': 0,
                    'stroke' : '#000'
                });
                var left = paper.rect(0, 0, x, originalHeight).attr({
                    'fill': '#000',
                    'fill-opacity': 0.5,
                    'stroke-opacity' : 0.5,
                    'stroke-width': 0,
                    'stroke' : '#000'
                });
                var right = paper.rect(x + width, 0, originalWidth - x - width, originalHeight).attr({
                    'fill': '#000',
                    'fill-opacity': 0.5,
                    'stroke-opacity' : 0.5,
                    'stroke-width': 0,
                    'stroke' : '#000'
                });

                set.push(top);
                set.push(bottom);
                set.push(left);
                set.push(right);

                return set;
            };

            drawCropTool = function(x, y, width, height, handleSize, handleColor, boxColor, isDrawingShadow) {

                var set = paper.set();


                if (isDrawingShadow) {
                    var shadow = drawShadow(x, y, width, height);
                    set.push(shadow);
                }

                var box = paper.rect(x, y, width, height).attr({
                    'stroke-dasharray': ['-'],
                    'stroke': boxColor
                });


                var handleOffset = handleSize / 2;
                var centerX = width / 2;
                var centerY = height / 2;

                var nw = drawHandle(x - handleOffset, y - handleOffset, handleSize, handleSize, handleColor, 'nw');
                var n = drawHandle(x + centerX - handleOffset, y - handleOffset, handleSize, handleSize, handleColor, 'n');
                var ne = drawHandle(x + width - handleOffset, y - handleOffset, handleSize, handleSize, handleColor, 'ne');
                var w = drawHandle(x - handleOffset, y + centerY - handleOffset, handleSize, handleSize, handleColor, 'w');
                var e = drawHandle(x + width - handleOffset, y + centerY - handleOffset, handleSize, handleSize, handleColor, 'e');
                var sw = drawHandle(x - handleOffset, y + height - handleOffset, handleSize, handleSize, handleColor, 'sw');
                var s = drawHandle(x + centerX - handleOffset, y + height - handleOffset, handleSize, handleSize, handleColor, 's');
                var se = drawHandle(x + width - handleOffset, y + height - handleOffset, handleSize, handleSize, handleColor, 'se');



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
            initCropCoords();
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