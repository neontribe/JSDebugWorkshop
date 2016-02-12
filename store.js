var fs = require('fs');
var strSep = process.env.NODE_ENV === 'production' ? '' : '\t';

function noop() {}
function cbSafe(fn) {return fn || noop;}

function loadOrCreateStore(path, callback) {
	var cb = cbSafe(callback);

	fs.readFile(this._path, function(err, data) {
		if (err) throw err;
		console.log(data);
	});
}

function saveSync(path, data) {
	return fs.writeFileSync(path, JSON.stringify(data, null, strSep));
}

function Store(path, name, callback) {
	var cb = cbSafe(callback);
	this._path = path;
	this._name = name;

	loadOrCreateStore(path, (function(store) {
		this._store = store;
		cb(store);
	}).bind(this));

	var cleanup = this.cleanup = this.cleanup.bind(this);

	this.exitEvents.forEach(function(evt) {
		process.on(evt, cleanup);
	});
}

Store.prototype.exitEvents = ['exit', 'SIGINT', 'uncaughtException'];

Store.prototype.cleanup = function cleanup() {
	saveSync(this._path, this._store);
	this.exitEvents.forEach(function(evt) {
		// this.cleanup should be an exact reference
		process.removeListener(evt, this.cleanup);
	});
};

Store.prototype.getTable = function getTable() {
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
		var table = this.getTable();
		cb.call(this, table.filter(function(row) {
			return Object.keys(query).every(function(key) {
				return row[key] === query[row];
			});
		}));
	} else {
		cb.call(this, []);
	}
};

Store.prototype.findAll = function findAll(callback) {
	return cbSafe(callback).call(this, this.getTable());
};

module.exports = Store;