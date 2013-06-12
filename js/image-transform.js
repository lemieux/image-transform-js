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
                rotationAnimation: 500,
                boxBgColor: '#4a525a'
            }, opts);


        var degreesToRadian = Math.PI / 180;


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

            rotate = function(angle) {

                var radians, sint, cost, h1, h2, hh, ww;

                if (angle <= 90) {
                    radians = angle * degreesToRadian;
                } else if (angle <= 180) {
                    radians = (180 - angle) * degreesToRadian;
                } else if (angle <= 270) {
                    radians = (angle - 180) * degreesToRadian;
                } else {
                    radians = (360 - angle) * degreesToRadian;
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
                    }, options.rotationAnimation, "<>");
                } else {
                    image.transform("r" + angle + "s" + scale);
                }
            };


            initTarget();

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