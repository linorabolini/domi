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

        // default configuration
        
        var _ = {};
            _.elPrefix            = ".js-";
            _.elTab               = _.elPrefix + 'tab';
            _.elToggle            = _.elPrefix + 'toggle';
            _.elOverflowBox       = _.elPrefix + 'overflow-box';
            _.elScrollTrigger     = _.elPrefix + 'scroll-trigger';
            _.attrPrefix          = "data-";
            _.attrTarget          = _.attrPrefix + "target";
            _.attrToggleClass     = _.attrPrefix + "toggle-class";
            _.attrGroupId         = _.attrPrefix + "group-id";
            _.attrUniqueGroup     = _.attrPrefix + "unique-group-id";
            _.attrScope           = _.attrPrefix + "scope";
            _.attrPriority        = _.attrPrefix + "priority";
            _.attrFilters         = _.attrPrefix + "filters";
            _.attrTriggers        = _.attrPrefix + "triggers";
            _.attrListeners       = _.attrPrefix + "listeners";
            _.attrElementLoaded   = _.attrPrefix + "loaded";
            _.statusPrefix        = "js--";
            _.statusActive        = _.statusPrefix + "active";

        var _info = {
            elementsLoaded: 0,
            isListeningScroll: false,
            isListeningResize: false
        }

        // store data for window listeners
        
        var _overflowBoxes = [];
        var _scrollTriggers = [];
        var _hub = $('<div/>');

        // base element toggle function

        function toggle ($domiEl, status, silent) {
            var $target = getTarget($domiEl);
            var classData  = getToggleClass($domiEl);

            $target.toggleClass(classData, status);
            $domiEl.toggleClass(_.statusActive, status);
            triggerEvents($domiEl, status, silent);
        }

        function getTarget($domiEl, defaultSelector) {
            var scope = getScope($domiEl);
            var filters = getFilters($domiEl);
            var targetName = $domiEl.attr(_.attrTarget) || defaultSelector;
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
            return $domiEl.attr(_.attrScope);
        }

        function getFilters($domiEl) {
            return ($domiEl.attr(_.attrFilters) || "").split(',');
        }

        function getTriggers($domiEl) {
            return ($domiEl.attr(_.attrTriggers) || "").split(',');
        }

        function getListeners($domiEl) {
            return ($domiEl.attr(_.attrListeners) || "").split(',');
        }

        function getToggleClass($domiEl) {
            return $domiEl.attr(_.attrToggleClass);
        }

        function getGroupId($domiEl) {
            return $domiEl.attr(_.attrGroupId);
        }

        function getUniqueGroupId($domiEl) {
            return $domiEl.attr(_.attrUniqueGroup);
        }

        function getPriority($domiEl) {
            return $domiEl.attr(_.attrPriority) || "0";
        }

        function triggerEvents($domiEl, status, silent) {
            var triggers = getTriggers($domiEl);
            var sufix = status ? "--on" : "--off";

            $.each(triggers, function(i, event){
                if(!event) return;
                _hub.trigger(event + sufix);
            });

            if (!silent) {
                var groupId = getGroupId($domiEl);
                groupId && _hub.trigger("group:" + groupId, $domiEl, status);

                var uniqueGroupId = getUniqueGroupId($domiEl);
                uniqueGroupId && _hub.trigger("unique-group:" + uniqueGroupId, $domiEl, status);
            }
        }

        function registerAsLoaded($domiEl) {
            var isLoaded = $domiEl.attr(_.attrElementLoaded);

            if(isLoaded) {
                return isLoaded;
            }

            $domiEl.attr(_.attrElementLoaded, true);
            _info.elementsLoaded++;

            var listeners = getListeners($domiEl);
            var groupId = getGroupId($domiEl);
            var uniqueGroupId = getUniqueGroupId($domiEl);

            groupId && _hub.on("group:" + groupId, function(event, $domiElSender, status) {
                console.log(event.type + " triggered");
                console.log($domiEl.is($domiElSender));
                if(!$domiEl.is($domiElSender)) {
                    $domiEl.setActive(status, true);
                }
            });


            uniqueGroupId && _hub.on("unique-group:" + uniqueGroupId, function(event, $domiElSender, status) {
                console.log(event.type + " triggered");
                console.log($domiEl.is($domiElSender));
                if(!$domiEl.is($domiElSender)) {
                    $domiEl.setActive(false, true);
                }
            });

            $.each(listeners, function(i, listener) {
                var l = listener.split(":");

                switch(l[0]) {
                    case "on":
                        _hub.on(l[1], function(event) {
                            console.log(event.type + " triggered");
                            $domiEl.setActive(true, false);
                        });
                        break;
                    case "off":
                        _hub.on(l[1], function(event) {
                            console.log(event.type + " triggered");
                            $domiEl.setActive(false, false);
                        });
                        break;
                }
            });

            return isLoaded
        }

        // js-tab
        // 
        // usage:
        // 
        // <div class="js-tab" data-target="#menu" data-toggle-class="opened">
        function createTab(selector) {
            $(selector).each(function() {
                var $el = $(this);

                if(registerAsLoaded($el)) {
                    return
                }

                $el.setActive = function (newStatus, silent) {
                    toggle($el, newStatus, silent);
                }

                $el.on('click', function(e) {
                    e.preventDefault();
                    var status = $el.hasClass(_.statusActive);

                    if(!status) {
                        $el.setActive(true, false); 
                    }
                });
            });
        }


        // js-toggle
        // 
        // usage:
        // 
        // <div class="js-toggle" data-target="body" data-toggle-class="main-menu-opened">
        //
        function createToggle(selector) {
            $(selector).each(function() {
                var $el = $(this);
                
                if(registerAsLoaded($el)) {
                    return
                }

                $el.setActive = function (newStatus, silent) {
                    toggle($el, newStatus, silent);
                }

                $el.on('click', function(e) {
                    e.preventDefault();
                    var status = $el.hasClass(_.statusActive);

                    $el.setActive(!status, false);                    
                });
            });
        }


        // js-overflow-box
        // 
        // usage:
        // 
        // <div class="js-overflow-box" data-target="body">
        //

        function createOverflowBox(selector) {
            $(selector).each(function() {
                var $el      = $(this);
                var children = $el.children();
                var tmpPriority;
                var priority;
                var $current;
                var $min;
                var $max;
                var $tmp;
                var pA;
                var pB;
                var c;
                var i;

                if(registerAsLoaded($el)) {
                    return
                }

                $el.setActive = function (newStatus, silent) {
                    if(newStatus) {
                        checkOverflowBoxes([$el], silent);
                    }
                }

                _overflowBoxes.push($el);

                children.each(function(i, current){
                    $current = $(current);

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
                
                $el.data('children', children);
            });

            if(!_info.isListeningResize && _overflowBoxes.length) {
                $(window).resize(onResize);
                onResize()
                _info.isListeningResize = true;
            }
        }
        
        function onResize() {
            checkOverflowBoxes();
        }

        function checkOverflowBoxes(overflowBoxes, silent) {
            $.each(overflowBoxes || _overflowBoxes, function(i, $container) {
                var containerWidth = $container.width();
                var $target        = getTarget($container);
                var tmpWidth       = 0;
                var children       = $container.data('children');
                var isTargetActive = false;
                var canAddMore     = true;

                $.each(children, function (i, el) {
                    var $el = $(el);
                    var previousNode = $el.data('data-left-node');
                    if(!previousNode) {
                        $container.prepend($el);
                    } else {
                        $el.insertAfter(previousNode);
                    }
                });

                $.each(children, function (i, el) {
                    var $el = $(el);
                    var elWidth = $el.outerWidth(true);
                    if(tmpWidth + elWidth < containerWidth && canAddMore) {
                        tmpWidth += elWidth;
                    } else {
                        if($target) {
                            $target.append($el);
                        } else {
                            $el.remove();
                        }
                        canAddMore = false;
                        isTargetActive = true;
                    }
                });

                $container.toggleClass(_.statusActive, isTargetActive);
                $target.toggleClass(_.statusActive, isTargetActive);
                triggerEvents($container, isTargetActive, silent);
            });
        }


        // scroll triggers 
        // 
        // usage:
        // 
        // <div class="js-scroll-trigger" data-target="body" data-toggle-class="activate-fixed-header">
        // 

        function createScrollTrigger(selector) {
            $(selector).each(function() {
                var $el = $(this);
                
                if(registerAsLoaded($el)) {
                    return
                }

                // move this to a prototype
                $el.setActive = function (newStatus, silent) {
                    var $target   = getTarget($el, 'body');
                    var classData = getToggleClass($el);
                    $target.toggleClass(classData, newStatus);
                    $el.toggleClass(_.statusActive, newStatus);
                    triggerEvents($el, newStatus, silent);
                }

                _scrollTriggers.push($el);
            });

            if(!_info.isListeningScroll && _scrollTriggers.length) {
                $(window).scroll(checkScrollTriggers);
                checkScrollTriggers();
                _info.isListeningScroll = true;
            }
        }

        function checkScrollTriggers() {
            var scroll = $(window).scrollTop();
            $.each(_scrollTriggers, function(i, $scrollTrigger) {
                var currentStatus = $scrollTrigger.hasClass(_.statusActive);
                var newStatus     = $scrollTrigger.offset().top + $scrollTrigger.outerHeight(true) < scroll;

                if(currentStatus != newStatus) {
                    $scrollTrigger.setActive(newStatus, false);
                }
            });
        }

        // entry point      

        $.fn.domi = function (options) {

            // Iterate and reformat each matched element.
            return this.each(function() {
            
                var $el = $( this );
            
                createTab($el.find(_.elTab));
                createToggle($el.find(_.elToggle));
                createOverflowBox($el.find(_.elOverflowBox));
                createScrollTrigger($el.find(_.elScrollTrigger));
            
            });
        }

        $.fn.domi.status = _info;
        $.fn.domi.hub = _hub;

        // run for all the body elements by default
        $('body').domi();
    });
}));
