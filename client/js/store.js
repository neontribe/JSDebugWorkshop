/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	function dataOrThrow(callback) {
		return function(err, data) {
			if (err) {
				throw new Error((err && err.message || 'Something went wrong') + ' (' + this.status + ',' + this.response + ')');
			}
			if (callback) {
				callback(data);
			}
		};
	}

	function get(url, callback) {
		ajax(url, dataOrThrow(callback));
	}
	function post(url, data, callback) {
		return ajax(url, dataOrThrow(callback), {
			data: data,
			type: 'json',
			method: 'POST'
		});
	}
	function put(url, data, callback) {
		return ajax(url, dataOrThrow(callback), {
			data: data,
			type: 'json',
			method: 'PUT'
		});
	}
	function patch(url, data, callback) {
		return ajax(url, dataOrThrow(callback), {
			data: data,
			type: 'json',
			method: 'PATCH'
		});
	}
	function sendDelete(url, callback) {
		ajax(url, dataOrThrow(callback), {
			method: 'DELETE'
		});
	}

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback
	 */
	function Store(name) {
		this._dbName = name;
	}

	/**
	 * Finds items based on a query given as a JS object
	 *
	 * @param {object} query The query to match against (i.e. {foo: 'bar'})
	 * @param {function} callback	 The callback to fire when the query has
	 * completed running
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		post('/api', query, callback);
	};

	/**
	 * Will retrieve all data from the collection
	 *
	 * @param {function} callback The callback to fire upon retrieving data
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
    var self = this;
		get('/api', function(records) {
		    callback(self.order(records));
    });
	};

	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 *
	 * @param {object} updateData The data to save back into the DB
	 * @param {function} callback The callback to fire after saving
	 * @param {number} id An optional param to enter an ID of an item to update
	 */
	Store.prototype.save = function (updateData, callback, id) {
		callback = callback || function () {};

		var findAll = this.findAll.bind(this);
		// If an ID was actually given, find the item and update each property
		if (id) {
			patch('/api/' + id, updateData, function(newDat) {
				console.log(newDat);
				findAll(callback);
			});
		} else {
			put('/api', updateData, function(newDat) {
				console.log(newDat);
				findAll(callback);
			});
		}
	};

	/**
	 * Will take a store array containing a list of todos 
	 * and definitely sort them correctly to put incomplete todos first
	 *
	 * @param {array} Todo array to sort 
	 * @return {array} Correctly sorted todos 
	 */
	Store.prototype.order = function(data) {
		data.sort(function(a, b) {
			// Adding a negation of the 'completed' boolean for the b object will produce a viable 'fix' in this scenario
			return !a.completed ^ !b.completed;
		});
		// console.log(data.todos.map(f => f.title));
		return data;
	};

	/**
	 * Will remove an item from the Store based on its ID
	 *
	 * @param {number} id The ID of the item you want to remove
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.remove = function (id, callback) {
		if (id && callback) {
			sendDelete('/api/' + id, callback);
		}
	};

	/**
	 * Will drop all storage and start fresh
	 *
	 * @param {function} callback The callback to fire after dropping the data
	 */
	Store.prototype.drop = function (callback) {
		sendDelete('/api', callback);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);
