var fs = require('fs');
var DEV = process.env.NODE_ENV !== 'production';

function throwOrNoop(err) {
	if (err) {
		if (!(err instanceof Error)) {
			err = new Error('Something exploded, this is all we have: ' + err);
		}
		throw err;
	}
}
function cbSafe(fn) {return fn || throwOrNoop;}

function saveStore(path, data, cb) {return fs.writeFile(path, JSON.stringify(data, null, DEV ? '\t' : ''), cb);}
function saveStoreSync(path, data) {return fs.writeFileSync(path, JSON.stringify(data, null, DEV ? '\t' : ''));}
function clone(d) {return JSON.parse(JSON.stringify(d));}

function loadOrCreateStore(path, callback) {
	var cb = cbSafe(callback);

	function don(err, data) {
		if (err) {
			return cb(err);
		}
		var dat = data.toString();
		try {
			dat = JSON.parse(dat);
		} catch(e) {
			console.log(e);
			throw new Error('Could not parse data at provided path (' + path + '), quiting...');
		}
		console.log('imported store');

		return cb(err, dat);
	}

	fs.readFile(path, function(err, data) {
		if (err) {
			if (err.code === 'ENOENT') {
				console.log('no store, creating one at (' + path + ')');
				return saveStore(path, {}, function(err) {
					don(err, '{}'); // ಠ_ಠ
				});
			}
		}
		return don(err, data);
	});
}

function Store(path, name, callback) {
	var cb = cbSafe(callback);
	this._path = path;
	this._name = name;

	var saveSync = this.saveSync.bind(this);
	this._cleanup = [];

	function sigint() {
		saveSync();
		// let other bindings do _synchronous_ things
		setImmediate(function() {
			process.exit();
		});
	}
	function uncaughtException(err) {
		saveSync();
		throw err instanceof Error ? err : new Error(err);
	}

	this._bindProcessAndAddCleanup('exit', saveSync);
	this._bindProcessAndAddCleanup('SIGINT', sigint);
	this._bindProcessAndAddCleanup('uncaughtException', uncaughtException);

	loadOrCreateStore(path, (function(err, store) {
		this._store = store;
		cb(err, store);
	}).bind(this));
}

Store.prototype._bindProcessAndAddCleanup = function _bindProcessAndAddCleanup(evt, cb) {
	process.on(evt, cb);
	this._cleanup.push(function() {
		process.removeListener(evt, cb);
	});
};

Store.prototype.close = function close() {
	this.saveSync();
	this._cleanup.forEach(function(fn) {fn();});
};

Store.prototype.saveSync = function saveSync() {
	if (this._store) {
		saveStoreSync(this._path, this._store);
	}
};

Store.prototype.save = function save(cb) {
	if (this._store) {
		saveStore(this._path, this._store, cb);
	}
};

Store.prototype._getTable = function _getTable() {
	var table = this._store[this._name];
	if (!table) {
		this._store[this._name] = table = [];
	}
	return table;
};

Store.prototype.find = function find(query, callback) {
	var keys = query && Object.keys(query);
	var cb = cbSafe(callback);

	if (keys && keys.length) {
		var table = this._getTable();
		cb.call(this, null, clone(table.filter(function(row) {
			return Object.keys(query).every(function(key) {
				return row[key] === query[row];
			});
		})));
	} else {
		cb.call(this, null, []);
	}
};

Store.prototype.findOne = function findOne(id, callback) {
	var cb = cbSafe(callback);
	this.find({id: id}, function(err, found) {
		if (err) {
			return cb.call(this, err);
		}
		if (found[0]) {
			cb.call(this, null, found[0]);
		} else {
			cb.call(this, new Error(''));
		}
	});
};

Store.prototype.findAll = function findAll(callback) {
	return cbSafe(callback).call(this, null, clone(this._getTable()));
};

Store.prototype._insert = function _insert(record, callback) {
	var cb = cbSafe(callback);

	this._getTable().push(record);
	cb.call(this, null, record);
};

Store.prototype.insert = function insert(record, callback) {
	var cb = cbSafe(callback);
	var cloned = clone(record);
	cloned.id = Date.now();

	this._insert(record, cb);
};

Store.prototype.remove = function remove(id, callback) {
	var cb = cbSafe(callback);
	this.findOne(id, function(err, found) {
		if (err) {
			return cb.call(this, err);
		}
		var table = this._getTable();
		var i = table.indexOf(found);
		table[i] = null;
		cb.call(this, null, found);
	});
};

Store.prototype.update = function update(id, newData, callback) {
	var cb = cbSafe(callback);
	this.remove(id, function(err) {
		if (err) {
			return cb.call(this, err);
		}
		var cloned = clone(newData);
		cloned.id = id;
		this._insert(cloned);
	});
};

module.exports = Store;