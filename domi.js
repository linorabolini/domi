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

        // configuration
        // 
        
        var _elPrefix        = ".js-";
        var _elTab           = _elPrefix + 'tab';
        var _elToggle        = _elPrefix + 'toggle';
        var _elOverflowBox   = _elPrefix + 'overflow-box';
        var _elScrollTrigger = _elPrefix + 'scroll-trigger';
        var _attrPrefix      = "data-";
        var _attrTarget      = _attrPrefix + "target";
        var _attrToggleClass = _attrPrefix + "toggle-class";
        var _attrGroupId     = _attrPrefix + "group-id";
        var _attrScope     = _attrPrefix + "scope";
        var _attrPriority    = _attrPrefix + "priority";
        var _attrFilters    = _attrPrefix + "filters";
        var _statusPrefix    = "js--";
        var _statusActive    = _statusPrefix + "active";

        // base element toggle function

        function toggle (_selector, $domiEl, status) {
            var $target = getTarget($domiEl);
            var classData  = getToggleClass($domiEl);

            $target.toggleClass(classData, status);

            var registeredElements = getRegisteredElements(_selector, $target);
            $.each(registeredElements, function(i, $el) {
                if(classData == getToggleClass($el)) {
                    $el.toggleClass(_statusActive, status);
                }
            });
        }

        function toggleByGroupId(_selector, $domiEl, status) {
            var groupId = getGroupId($domiEl);
            if(!groupId) return;
            
            $(_selector + '[' + _attrGroupId + '=' + groupId +']').each(function() {
                toggle(_selector, $(this), status);
            });
        }

        function getTarget($domiEl) {
            var scope = getScope($domiEl);
            var filters = getFilters($domiEl);
            var targetName = $domiEl.attr(_attrTarget);
            var query;
            
            if(scope) {
                query = $domiEl[scope](targetName);
            } else {
                query = $(targetName);
            }

            $.each(filters, function(i, filter){
                if(!filter) return;
                query = query && query[filter]();
            });

            return query;
        }

        function getScope($domiEl) {
            return $domiEl.attr(_attrScope);
        }

        function getFilters($domiEl) {
            return ($domiEl.attr(_attrFilters) || "").split(',');
        }

        function getToggleClass($domiEl) {
            return $domiEl.attr(_attrToggleClass);
        }

        function getGroupId($domiEl) {
            return $domiEl.attr(_attrGroupId);
        }

        function getPriority($domiEl) {
            return $domiEl.attr(_attrPriority) || "0";
        }

        function registerToTarget(type, $domiEl, $target) {
            var data = $target.data();
            data['domi'] = data['domi'] || {};
            data['domi'][type] = data['domi'][type] || [];

            // add the element to the list
            data['domi'][type].push($domiEl);
            $target.data('domi', data['domi']);
        }

        function getRegisteredElements(type, $target) {
            var data = $target.data();
            return data['domi'][type];
        }

        // js-tab
        // 
        // usage:
        // 
        // <div class="js-toggle" data-target="#menu" data-toggle-class="opened">
        $(_elTab).each(function(i, el) {
            var $el = $(el);
            registerToTarget(_elTab, $el, getTarget($el));
        });
        $(_elTab).on('click', function(e) {
            e.preventDefault();
            var $this  = $(this);
            var status = $this.hasClass(_statusActive);

            if(!status) {
                toggleByGroupId(_elTab, $this, false);
                toggle(_elTab, $this, !status);
            }
        });

        // js-toggle
        // 
        // usage:
        // 
        // <div class="js-toggle" data-target="body" data-toggle-class="main-menu-opened">
        //

        $(_elToggle).each(function(i, el) {
            var $el = $(el);
            registerToTarget(_elToggle, $el, getTarget($el));
        });
        $(_elToggle).on('click', function(e) {
            e.preventDefault();
            var $this  = $(this);
            var status = $this.hasClass(_statusActive);

            toggleByGroupId(_elToggle, $this, false);
            toggle(_elToggle, $this, !status);
        });

        // js-overflow-box
        // 
        // usage:
        // 
        // <div class="js-overflow-box" data-target="body">
        //


        $(_elOverflowBox).each(function(){
            var $this = $(this);
            var children = $this.children();
            var i;
            var c;
            var $current;
            var $min;
            var $max;
            var $tmp;
            var priority;
            var tmpPriority;
            var pA;
            var pB;

            children.each(function(i, el){
                $current = $(el);

                $min = null;
                priority = getPriority($current);

                for (c = i - 1; c >= 0; c--) {
                    $tmp = $(children[c]);
                    tmpPriority = getPriority($tmp);

                    if (!$min && tmpPriority <= priority){
                        $min = $tmp;
                    }
                };

                $current.data('data-left-node', $min);
            });

            var priorityList = children.sort(function(a, b) {
                pA = getPriority($(a));
                pB = getPriority($(b));

                return pA - pB;
            });
            
            $this.data('children', priorityList);
        });

        function checkOverflowBoxes() {
            $(_elOverflowBox).each(function(){
                var $container = $(this);
                var containerWidth = $container.width();
                var $target = getTarget($container);
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
                            var previousNode = $el.data('data-left-node');
                            if(!previousNode) {
                                $container.prepend($el);
                            } else {
                                $el.insertAfter(previousNode);
                            }
                        }
                    } else {
                        if($el.parent()[0] == $container[0]) {
                            if($target) {
                                $target.append($el);
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
                var classData     = getToggleClass($this);
                var currentStatus = $this.hasClass(_statusActive);
                var newStatus     = ($this.offset().top + $this.outerHeight(true) < scroll);

                if(currentStatus != newStatus) {
                    var $target = getTarget($this);
                    $target.toggleClass(classData, newStatus);
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
