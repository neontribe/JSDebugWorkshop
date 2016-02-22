/*global NodeList */
(function (window) {
    'use strict';

    window.shallowExtend = function shallowExtend(a, b) {
        if (arguments.length < 3) {
            return Object.keys(b || {}).reduce(function(current, key) {
                if (typeof b[key] !== 'undefined') {
                    current[key] = b[key];
                }
                return current;
            }, a || {});
        }
        return shallowExtend.call(this, a, shallowExtend.apply(this, [].slice.call(arguments, 1)));
    };

    // Get element(s) by CSS selector:
    window.qs = function (selector, scope) {
        return (scope || document).querySelector(selector);
    };
    window.qsa = function (selector, scope) {
        return (scope || document).querySelectorAll(selector);
    };

    // addEventListener wrapper:
    window.$on = function (target, type, callback, useCapture) {
        target.addEventListener(type, callback, !!useCapture);
    };

    window.$off = function(target, type, listener) {
        target.removeEventListener(type, listener);
    };

    // Attach a handler to event for all elements that match the selector,
    // now or in the future, based on a root element
    window.$delegate = function (target, selector, type, handler) {
        function dispatchEvent(event) {
            var targetElement = event.target;
            var potentialElements = window.qsa(selector, target);
            var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

            if (hasMatch) {
                handler.call(targetElement, event);
            }
        }

        // https://developer.mozilla.org/en-US/docs/Web/Events/blur
        var useCapture = type === 'blur' || type === 'focus';

        window.$on(target, type, dispatchEvent, useCapture);
    };

    // Find the element's parent with the given tag name:
    // $parent(qs('a'), 'div');
    window.$parent = function (element, tagName) {
        if (!element.parentNode) {
            return;
        }
        if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
            return element.parentNode;
        }
        return window.$parent(element.parentNode, tagName);
    };

    window.noop = function noop(){};

    // Allow for looping on nodes by chaining:
    // qsa('.foo').forEach(function () {})
    NodeList.prototype.forEach = Array.prototype.forEach;

    window.ajax = function ajax(url, callback, settingsOverrides) {
        var settings = window.shallowExtend({
            method: 'GET',
            data: '',
            type: 'form',
            callback: window.noop
        }, settingsOverrides, {callback: callback, url: url});

        var xhr = new XMLHttpRequest();
        var body;

        xhr.open(settings.method.toUpperCase(), settings.url);

        switch(settings.type) {
            case 'json':
                xhr.setRequestHeader('Content-Type', 'application/json');
                body = JSON.stringify(settings.data);
            break;
            case 'form':
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                if (settings.data && typeof settings.data === 'object') {
                    body = Object.keys(settings.data).map(function(key) {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(settings.data[key]);
                    }).join('&');
                }
            break;
        }

        xhr.addEventListener('load', function() {
            var dat = this.getResponseHeader('Content-Type');
            var conveter;
            switch(dat) {
                case 'application/json':
                    conveter = function conveter(response) {
                        return JSON.parse(response);
                    };
                break;
                default:
                    conveter = function conveter(response) {
                        return response;
                    };
            }

            if (this.status > 299) {
                return settings.callback.call(xhr, conveter(this.response));
            }
            return settings.callback.call(xhr, null, conveter(this.response));
        });

        xhr.send(body);
    };
})(window);
