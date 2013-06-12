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
            originalWidth = 0,
            originalHeight = 0,
            width = 0,
            height = 0,
            centerX = 0,
            centerY = 0,
            currentAngle = 0,
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

            originalWidth = self.img.naturalWidth;
            originalHeight = self.img.naturalHeight;

            width = self.img.width;
            height = self.img.height;

            centerX = width / 2;
            centerY = height / 2;

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
                image = paper.image(options.src, 0, 0, width, height);
            };

            rotate = function(delta) {
                currentAngle = currentAngle + delta;

                var radians, sint, cost, h1, h2, hh, ww;
                if (currentAngle <= 90) {
                    radians = currentAngle * degreesToRadian;
                } else if (currentAngle <= 180) {
                    radians = (180 - currentAngle) * degreesToRadian;
                } else if (currentAngle <= 270) {
                    radians = (currentAngle - 180) * degreesToRadian;
                } else {
                    radians = (360 - currentAngle) * degreesToRadian;
                }


                sint = Math.sin(radians);
                cost = Math.cos(radians);

                var height = image.attrs.height, width = image.attrs.width;

                h1 = height * height / (width * sint + height * cost);
                h2 = height * width / (width * cost + height * sint);
                hh = Math.min(h1, h2);
                ww = hh * width / height;

                var scale = hh / ww;

                if (options.rotationAnimation !== undefined && typeof options.rotationAnimation === "number") {
                    image.animate({
                        transform: "r" + currentAngle + "s" + scale
                    }, options.rotationAnimation, "<>");
                } else {
                    image.transform("r" + currentAngle + "s" + scale);
                }
            };


            initTarget();

            self.rotate = rotate;
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