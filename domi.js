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
        
        var _elPrefix          = ".js-";
        var _elTab             = _elPrefix + 'tab';
        var _elToggle          = _elPrefix + 'toggle';
        var _elOverflowBox     = _elPrefix + 'overflow-box';
        var _elScrollTrigger   = _elPrefix + 'scroll-trigger';
        var _attrPrefix        = "data-";
        var _attrTarget        = _attrPrefix + "target";
        var _attrToggleClass   = _attrPrefix + "toggle-class";
        var _attrGroupId       = _attrPrefix + "group-id";
        var _attrScope         = _attrPrefix + "scope";
        var _attrPriority      = _attrPrefix + "priority";
        var _attrFilters       = _attrPrefix + "filters";
        var _attrElementLoaded = _attrPrefix + "loaded";
        var _statusPrefix      = "js--";
        var _statusActive      = _statusPrefix + "active";

        // store data for window listeners
        
        var _overflowBoxes = [];
        var _scrollTriggers = [];

        // global data store

        domi = {
            createTab: createTab,
            createToggle: createToggle,
            createScrollTrigger: createScrollTrigger,
            createOverflowBox: createOverflowBox,
            reload: reload,
            elementsLoaded: 0,
            isListeningScroll: false,
            isListeningResize: false
        }

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

        function getTarget($domiEl, defaultSelector) {
            var scope = getScope($domiEl);
            var filters = getFilters($domiEl);
            var targetName = $domiEl.attr(_attrTarget) || defaultSelector;
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

        function registerAsLoaded($domiEl) {
            var value = $domiEl.attr(_attrElementLoaded);

            if(!value) {
                $domiEl.attr(_attrElementLoaded, true);
                domi.elementsLoaded++;
            }

            return value
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
        function createTab(selector) {
            $(selector).each(function() {
                var $el = $(this);

                if(registerAsLoaded($el)) {
                    return
                }

                registerToTarget(_elTab, $el, getTarget($el));
                $el.on('click', function(e) {
                    e.preventDefault();
                    var $this  = $(this);
                    var status = $this.hasClass(_statusActive);

                    if(!status) {
                        toggleByGroupId(_elTab, $this, false);
                        toggle(_elTab, $this, !status);
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

                registerToTarget(_elToggle, $el, getTarget($el));
                $el.on('click', function(e) {
                    e.preventDefault();
                    var $this  = $(this);
                    var status = $this.hasClass(_statusActive);

                    toggleByGroupId(_elToggle, $this, false);
                    toggle(_elToggle, $this, !status);
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

            if(!domi.isListeningResize && _overflowBoxes.length) {
                $(window).resize(checkOverflowBoxes);
                checkOverflowBoxes();
                domi.isListeningResize = true;
            }
        }
        

        function checkOverflowBoxes() {
            $.each(_overflowBoxes, function(i, $container) {
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

                $container.toggleClass(_statusActive, isTargetActive);
                $target.toggleClass(_statusActive, isTargetActive);
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

                _scrollTriggers.push($el);
            });

            if(!domi.isListeningScroll && _scrollTriggers.length) {
                $(window).scroll(checkScrollTriggers);
                checkScrollTriggers();
                domi.isListeningScroll = true;
            }
        }

        function checkScrollTriggers() {
            var scroll = $(window).scrollTop();
            $.each(_scrollTriggers, function(i, $scrollTrigger) {
                var classData     = getToggleClass($scrollTrigger);
                var currentStatus = $scrollTrigger.hasClass(_statusActive);
                var newStatus     = $scrollTrigger.offset().top + $scrollTrigger.outerHeight(true) < scroll;

                if(currentStatus != newStatus) {
                    var $target = getTarget($scrollTrigger, 'body');
                    $target.toggleClass(classData, newStatus);
                    $scrollTrigger.toggleClass(_statusActive, newStatus);
                }
            });
        }

        // init / reload
        
        function reload() {
            createTab(_elTab);
            createToggle(_elToggle);
            createOverflowBox(_elOverflowBox);
            createScrollTrigger(_elScrollTrigger);
        }

        reload();
    });
}));
