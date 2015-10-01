(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $(function() {
        var _elPrefix        = ".js-";
        var _elToggle        = _elPrefix + 'toggle';
        var _elTab           = _elPrefix + 'tab';
        var _elScrollTrigger = _elPrefix + 'scroll-trigger';
        var _attrPrefix      = "data-";
        var _attrTarget      = _attrPrefix + "target";
        var _attrToggleClass = _attrPrefix + "toggle-class";
        var _attrGroupId     = _attrPrefix + "group-id";
        var _statusPrefix    = "js--";
        var _statusActive    = _statusPrefix + "active";

        // base element toggle function

        function toggle($element, status) {
            var targetData = $element.attr(_attrTarget);
            var classData  = $element.attr(_attrToggleClass);

            $(targetData).toggleClass(classData, status);

            var query = '[' + _attrTarget + '="' + targetData + '"]['+ _attrToggleClass +'="'+ classData +'"]';
            $(query).toggleClass(_statusActive, status);
        }

        // js-tab
        // 
        // usage:
        // 
        // <div class="js-toggle" data-target="#menu" data-toggle-class="opened">

        $(_elTab).on('click', function() {
            var $this  = $(this);
            var status = $this.hasClass(_statusActive);

            if(!status) {
                var tabId = $this.attr(_attrGroupId);
                if(!tabId) {
                    return;
                } else {
                    $(_elTab + '[' + _attrGroupId + '=' + tabId +']').each(function() {
                        toggle($(this), false);
                    });
                }
            }
            toggle($this, !status);
        });

        // js-toggle
        // 
        // usage:
        // 
        // <div class="js-toggle" data-target="body" data-toggle-class="main-menu-opened">
        //

        $(_elToggle).on('click', function() {
            var $this  = $(this);
            var status = $this.hasClass(_statusActive);

            toggle($this, !status);
        });

        // scroll triggers 
        // 
        // usage:
        // 
        // <div class="js-scroll-trigger" data-target="body" data-toggle-class="activate-fixed-header">
        // 

        function checkScrollTriggers() {
            var scroll = $(window).scrollTop();
            $(_elScrollTrigger).each(function() {
                var $this         = $(this);
                var classData     = $this.attr(_attrToggleClass);
                var currentStatus = $this.hasClass(_statusActive);
                var newStatus     = ($this.offset().top + $this.outerHeight(true) < scroll);

                if(currentStatus != newStatus) {
                    var $targetData = $($this.attr(_attrTarget));
                    $targetData.toggleClass(classData, newStatus);
                    $this.toggleClass(_statusActive, newStatus);
                }
            });
        }

        if($(_elScrollTrigger).length) {
            $(window).scroll(checkScrollTriggers);
            checkScrollTriggers();
        }
    });
}));
