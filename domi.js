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
        var _elTab           = _elPrefix + 'tab';
        var _elToggle        = _elPrefix + 'toggle';
        var _elOverflowBox   = _elPrefix + 'overflow-box';
        var _elScrollTrigger = _elPrefix + 'scroll-trigger';
        var _attrPrefix      = "data-";
        var _attrTarget      = _attrPrefix + "target";
        var _attrToggleClass = _attrPrefix + "toggle-class";
        var _attrGroupId     = _attrPrefix + "group-id";
        var _statusPrefix    = "js--";
        var _statusActive    = _statusPrefix + "active";

        // base element toggle function

        function toggle ($element, status) {
            var targetData = $element.attr(_attrTarget);
            var classData  = $element.attr(_attrToggleClass);

            $(targetData).toggleClass(classData, status);

            var query = '[' + _attrTarget + '="' + targetData + '"]['+ _attrToggleClass +'="'+ classData +'"]';
            $(query).toggleClass(_statusActive, status);
        }

        function toggleByGroupId(_selector, $element, status) {
            var groupId = $element.attr(_attrGroupId);
            if(!groupId) return;
            
            $(_selector + '[' + _attrGroupId + '=' + groupId +']').each(function() {
                toggle($(this), status);
            });
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
                toggleByGroupId(_elTab, $this, false);
                toggle($this, !status);
            }
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

            toggleByGroupId(_elToggle, $this, false);
            toggle($this, !status);
        });

        // js-overflow-box
        // 
        // usage:
        // 
        // <div class="js-overflow-box" data-target="body">
        //


        $(_elOverflowBox).each(function(){
            var $this = $(this);
            $this.data('children', $this.children());
        });

        function checkOverflowBoxes() {
            $(_elOverflowBox).each(function(){
                var $container = $(this);
                var containerWidth = $container.width();
                var targetData = $container.attr(_attrTarget);
                var tmpWidth = 0;

                var children = $container.data('children');
                
                $.each(children, function (i, el) {
                    var $el = $(el);
                    var elWidth = $el.outerWidth(true);

                    if(tmpWidth + elWidth < containerWidth) {
                        tmpWidth += elWidth;
                        if($el.parent()[0] == $container[0]) {
                            return
                        } else {
                            $container.append($el);
                        }
                    } else {
                        if($el.parent()[0] == $container[0]) {
                            if(targetData) {
                                $(targetData).append($el);
                            } else {
                                $el.remove();
                            }
                        } else {
                            return false
                        }
                    }
                })

            });
        }

        if($(_elOverflowBox).length) {
            $(window).resize(checkOverflowBoxes);
            checkOverflowBoxes();
        }

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
