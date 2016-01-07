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
            $domiEl.toggleClass(_statusActive, status);

            var registeredElements = getRegisteredElements(_selector, $target);
            registeredElements && $.each(registeredElements, function(i, $el) {
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
            $target.each(function(i, el){
                var $el = $(el);
                var data = $el.data('domi') || {};
                data[type] = data[type] || [];

                // add the element to the list
                data[type].push($domiEl);
                $el.data('domi', data);
            })

        }

        function getRegisteredElements(type, $target) {
            var data = $target.data('domi');
            if(!data) {
                console.warn("no data was stored, element registration failed?");
            }
            return data && data[type];
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


            function bubbleSort(a) {
                var swapped;
                do {
                    swapped = false;
                    for (var i=0; i < a.length-1; i++) {
                        if (getPriority($(a[i])) > getPriority($(a[i+1]))) {
                            var temp = a[i];
                            a[i] = a[i+1];
                            a[i+1] = temp;
                            swapped = true;
                        }
                    }
                } while (swapped);
            }
             
            bubbleSort(children);
            
            $this.data('children', children);
        });

        function checkOverflowBoxes() {
            $(_elOverflowBox).each(function(){
                var $container = $(this);
                var containerWidth = $container.width();
                var $target = getTarget($container);
                var tmpWidth = 0;

                var children = $container.data('children');

                var isTargetActive = false;
                var canAddMore = true;
                $.each(children, function (i, el) {
                    var $el = $(el);
                    var elWidth = $el.outerWidth(true);

                    if(tmpWidth + elWidth < containerWidth && canAddMore) {
                        tmpWidth += elWidth;
                        if($el.parent()[0] == $container[0]) {
                            return
                        } else {
                            var previousNode = $el.data('data-left-node');
                            if(!previousNode) {
                                $container.prepend($el);
                            } else {
                                debugger;
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
                            canAddMore = false;
                            isTargetActive = true;
                        } else {
                            isTargetActive = true;
                            return false
                        }
                    }
                });

                $container.toggleClass(_statusActive, isTargetActive);
                $target.toggleClass(_statusActive, isTargetActive);

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
