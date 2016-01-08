var fs = require('fs');

function noop() {}
function cb(fn) {return fn || noop;}

function DB(path, callback) {
	this._path = path;

	fs.readFile(this._path, function(err, data) {

	});
}

function API(dbPath) {

}

module.exports = API;