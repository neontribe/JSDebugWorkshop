/*global qs, qsa, $on, $off, $parent, $delegate */

(function (window) {
    'use strict';

    /**
     * View that abstracts away the browser's DOM completely.
     * It has two simple entry points:
     *
     *   - bind(eventName, handler)
     *     Takes a todo application event and registers the handler
     *   - render(command, parameterObject)
     *     Renders the given command with the options
     */
    function View(template) {
        this.template = template;

        this.ENTER_KEY = 13;
        this.ESCAPE_KEY = 27;
        this.BUG_CHAR = 'b';

        this.$todoList = qs('.todo-list');
        this.$todoItemCounter = qs('.todo-count');
        this.$clearCompleted = qs('.clear-completed');
        this.$main = qs('.main');
        this.$footer = qs('.footer');
        this.$toggleAll = qs('.toggle-all');
        this.$newTodo = qs('.new-todo');

        this.$splashButton = qs('.begin');
        this.$splashSection = qs('.splash');
        this.$hiddenBySplash = qsa('.no-splash');

        this.$title = qs('h1');
    }

    View.prototype._advanceFromSplash = function() {
        this.$splashSection.className = 'hidden';
        var hidden = this.$hiddenBySplash;
        for(var i = 0; i < hidden.length; i++) {
            var classes = hidden[i].className;
            hidden[i].className = classes.replace('no-splash', '');
        }
    };

    View.prototype._removeItem = function (id) {
        var elem = qs('[data-id="' + id + '"]');

        if (elem) {
            this.$todoList.removeChild(elem);
        }
    };

    View.prototype._clearCompletedButton = function (completedCount, visible) {
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? 'block' : 'none';
    };

    View.prototype._setFilter = function (currentPage) {
        qs('.filters .selected').className = '';
        qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
    };

    View.prototype._elementComplete = function (id, completed) {
        var listItem = qs('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        listItem.className = completed ? 'completed' : '';

        // In case it was toggled from an event and not by clicking the checkbox
        qs('input', listItem).checked = completed;
    };

    View.prototype._editItem = function (id, title) {
        var listItem = qs('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        listItem.className = listItem.className + ' editing';

        var input = document.createElement('input');
        input.className = 'edit';

        listItem.appendChild(input);
        input.focus();
        input.value = title;
    };

    View.prototype._editItemDone = function (id, title) {
        var listItem = qs('[data-id="' + id + '"]');

        if (!listItem) {
            return;
        }

        var input = qs('input.edit', listItem);
        listItem.removeChild(input);

        listItem.className = listItem.className.replace('editing', '');

        qsa('label', listItem).forEach(function (label) {
            label.textContent = title;
        });
    };

    View.prototype.render = function (viewCmd, parameter) {
        var self = this;
        var viewCommands = {
            showEntries: function () {
                self.$todoList.innerHTML = self.template.show(parameter);
            },
            removeItem: function () {
                self._removeItem(parameter);
            },
            updateElementCount: function () {
                self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
            },
            clearCompletedButton: function () {
                self._clearCompletedButton(parameter.completed, parameter.visible);
            },
            contentBlockVisibility: function () {
                self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
            },
            toggleAll: function () {
                self.$toggleAll.checked = parameter.checked;
            },
            setFilter: function () {
                self._setFilter(parameter);
            },
            clearNewTodo: function () {
                self.$newTodo.value = '';
            },
            elementComplete: function () {
                self._elementComplete(parameter.id, parameter.completed);
            },
            editItem: function () {
                self._editItem(parameter.id, parameter.title);
            },
            editItemDone: function () {
                self._editItemDone(parameter.id, parameter.title);
            },
            clearSplash: function() { 
                //call render with this to clear the splash from the controller
                self._advanceFromSplash();
            },
        };

        viewCommands[viewCmd]();
    };

    View.prototype._itemId = function (element) {
        var li = $parent(element, 'li');
        return parseInt(li.dataset.id, 10);
    };

    View.prototype._bindItemEditDone = function (handler) {
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'blur', function () {
            if (!this.dataset.iscanceled) {
                handler({
                    id: self._itemId(this),
                    title: this.value
                });
            }
        });

        $delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
            if (event.keyCode === self.ENTER_KEY) {
                // Remove the cursor from the input when you hit enter just like if it
                // were a real form
                this.blur();
            }
        });
    };

    View.prototype._bindItemEditCancel = function (handler) {
        var self = this;
        $delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
            if (event.keyCode === self.ESCAPE_KEY) {
                this.dataset.iscanceled = true;
                this.blur();

                handler({id: self._itemId(this)});
            }
        });
    };

    View.prototype._bindItemCreateBug = function() {
        var self = this;
        var bugEvent = 'keypress';
        var getChar = function getChar(charCode) {
            return String.fromCharCode(charCode);
        };
        var injectKeys = function injectKeys(event) {
            var payload = document.createTextNode(getChar(event.charCode));
            self.$title.appendChild(payload);
        };
        var triggerCheck = function triggerCheck(event) {
            var payload = getChar(event.charCode);
            if (payload === self.BUG_CHAR ) {
                // if the trigger is hit, we remove the trigger handler
                $off(self.$newTodo, bugEvent, triggerCheck);
                // and add our injection code to append subsequent keys to the page title
                $on(self.$newTodo, bugEvent, injectKeys);
            }
        };
        // we bind trigger check to each keypress in the input field
        $on(self.$newTodo, bugEvent, triggerCheck);
    };

    View.prototype.bind = function (event, handler) {
        var self = this;
        if (event === 'newTodo') {
            $on(self.$newTodo, 'change', function () {
                handler(self.$newTodo.value);
            });

        } else if (event === 'removeCompleted') {
            $on(self.$clearCompleted, 'click', function () {
                handler();
            });

        } else if (event === 'toggleAll') {
            $on(self.$toggleAll, 'click', function () {
                handler({completed: this.checked});
            });

        } else if (event === 'itemEdit') {
            $delegate(self.$todoList, 'li label', 'dblclick', function () {
                handler({id: self._itemId(this)});
            });

        } else if (event === 'itemRemove') {
            $delegate(self.$todoList, '.destroy', 'click', function () {
                handler({id: self._itemId(this)});
            });

        } else if (event === 'itemToggle') {
            $delegate(self.$todoList, '.toggle', 'click', function () {
                handler({
                    id: self._itemId(this),
                    completed: this.checked
                });
            });

        } else if (event === 'itemEditDone') {
            self._bindItemEditDone(handler);

        } else if (event === 'itemEditCancel') {
            self._bindItemEditCancel(handler);
        } else if (event === 'clearSplash') {
            $on(self.$splashButton, 'click', function() {
                self._advanceFromSplash();
            });
        } else if (event === 'itemCreateBug') {
            self._bindItemCreateBug();
        }
    };

    // Export to window
    window.app = window.app || {};
    window.app.View = View;
}(window));
