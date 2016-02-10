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
            _.elPrefix          = ".js-";
            _.elTab             = _.elPrefix + 'tab';
            _.elToggle          = _.elPrefix + 'toggle';
            _.elOverflowBox     = _.elPrefix + 'overflow-box';
            _.elScrollTrigger   = _.elPrefix + 'scroll-trigger';
            _.attrPrefix        = "data-";
            _.attrTarget        = _.attrPrefix + "target";
            _.attrToggleClass   = _.attrPrefix + "toggle-class";
            _.attrGroupId       = _.attrPrefix + "group-id";
            _.attrScope         = _.attrPrefix + "scope";
            _.attrPriority      = _.attrPrefix + "priority";
            _.attrFilters       = _.attrPrefix + "filters";
            _.attrElementLoaded = _.attrPrefix + "loaded";
            _.statusPrefix      = "js--";
            _.statusActive      = _.statusPrefix + "active";

        var info = {
            elementsLoaded: 0,
            isListeningScroll: false,
            isListeningResize: false
        }

        // store data for window listeners
        
        var _overflowBoxes = [];
        var _scrollTriggers = [];

        // base element toggle function

        function toggle (_selector, $domiEl, status) {
            var $target = getTarget($domiEl);
            var classData  = getToggleClass($domiEl);

            $target.toggleClass(classData, status);
            $domiEl.toggleClass(_.statusActive, status);

            var registeredElements = getRegisteredElements(_selector, $target);
            registeredElements && $.each(registeredElements, function(i, $el) {
                if(classData == getToggleClass($el)) {
                    $el.toggleClass(_.statusActive, status);
                }
            });
        }

        function toggleByGroupId(_selector, $domiEl, status) {
            var groupId = getGroupId($domiEl);
            if(!groupId) return;
            
            $(_selector + '[' + _.attrGroupId + '=' + groupId +']').each(function() {
                toggle(_selector, $(this), status);
            });
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

        function getToggleClass($domiEl) {
            return $domiEl.attr(_.attrToggleClass);
        }

        function getGroupId($domiEl) {
            return $domiEl.attr(_.attrGroupId);
        }

        function getPriority($domiEl) {
            return $domiEl.attr(_.attrPriority) || "0";
        }

        function registerAsLoaded($domiEl) {
            var value = $domiEl.attr(_.attrElementLoaded);

            if(!value) {
                $domiEl.attr(_.attrElementLoaded, true);
                info.elementsLoaded++;
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

                registerToTarget(_.elTab, $el, getTarget($el));
                $el.on('click', function(e) {
                    e.preventDefault();
                    var $this  = $(this);
                    var status = $this.hasClass(_.statusActive);

                    if(!status) {
                        toggleByGroupId(_.elTab, $this, false);
                        toggle(_.elTab, $this, !status);
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

                registerToTarget(_.elToggle, $el, getTarget($el));
                $el.on('click', function(e) {
                    e.preventDefault();
                    var $this  = $(this);
                    var status = $this.hasClass(_.statusActive);

                    toggleByGroupId(_.elToggle, $this, false);
                    toggle(_.elToggle, $this, !status);
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

            if(!info.isListeningResize && _overflowBoxes.length) {
                $(window).resize(checkOverflowBoxes);
                checkOverflowBoxes();
                info.isListeningResize = true;
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

                $container.toggleClass(_.statusActive, isTargetActive);
                $target.toggleClass(_.statusActive, isTargetActive);
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

            if(!info.isListeningScroll && _scrollTriggers.length) {
                $(window).scroll(checkScrollTriggers);
                checkScrollTriggers();
                info.isListeningScroll = true;
            }
        }

        function checkScrollTriggers() {
            var scroll = $(window).scrollTop();
            $.each(_scrollTriggers, function(i, $scrollTrigger) {
                var classData     = getToggleClass($scrollTrigger);
                var currentStatus = $scrollTrigger.hasClass(_.statusActive);
                var newStatus     = $scrollTrigger.offset().top + $scrollTrigger.outerHeight(true) < scroll;

                if(currentStatus != newStatus) {
                    var $target = getTarget($scrollTrigger, 'body');
                    $target.toggleClass(classData, newStatus);
                    $scrollTrigger.toggleClass(_.statusActive, newStatus);
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

        $.fn.domi.status = info;

        // run for all the body elements by default
        $('body').domi();
    });
}));
