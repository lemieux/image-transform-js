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
        this.each(function() {
            init.call(this, options);
        });
        return this;
    };

    function init(opts) {
        var self = this;
        self.transform = new Transform(self, opts);
    }

    function Transform(target, opts) {
        var src = $(target).attr('src');

        if (typeof src === 'undefined' || src === false) {
            src = '';
        }

        var initTarget,
            paper,
            self = this,
            $self = $(self),
            originalWidth = 0,
            originalHeight = 0,
            width = 0,
            height = 0,
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
                src: src,
                viewBoxHeight: $(target).height(),
                viewBoxWidth: $(target).width()
            }, opts);

        if (typeof src === 'undefined' || src === false) {
            throw "No src given!";
        }

        self.target = target;

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
            paper.setViewBox(0, 0, options.viewBoxWidth, options.viewBoxHeight, true);
        };


        initTarget();

        $self.trigger('init');
    }

    Transform.version = "0.0.1";

}));