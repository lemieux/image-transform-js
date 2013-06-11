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

    function init(options) {
        var self = this;
    }

    function Transform(options) {
        var self = this,
            $self = $(self);

        this.options = $.extend({
            cropstart: $.noop,
            cropstop: $.noop,
            rotatestart: $.noop,
            rotatestop: $.noop,
            init: $.noop,
            destroy: $.noop
        }, options);

        $self.on('cropstart', options.cropstart);
        $self.on('cropstop', options.cropstop);
        $self.on('rotatestart', options.rotatestart);
        $self.on('rotatestop', options.rotatestop);
        $self.on('init', options.init);
        $self.on('destroy', options.destroy);

    }

    Transform.version = "0.0.1";

}));