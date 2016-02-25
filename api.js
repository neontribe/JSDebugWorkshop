var Store = require('./store');
var DEV = process.env.NODE_ENV !== 'production';

function extend(a, b) {
	if (arguments.length <= 2) {
		var ab = {};
		var ay = a || {};
		var bee = b || {};
		Object.keys(ay).concat(Object.keys(bee)).forEach(function(key) {
			ab[key] = bee[key] || ay[key];
		});
		return ab;
	} else {
		// ಠ_ಠ
		return extend(a, extend.apply(null, [].slice.call(arguments, 1)));
	}
}

function extractBody(req, cb) {
	var b = '';
	req.on('data', function(buffer) {
		b += buffer.toString(); // implicit/magic with +=, but this is more readable...
	});

	req.on('end', function() {
		cb(null, b);
	});

	req.on('error', function(err) {
		cb(err);
	});
}

function processBody(req, cb) {
	var ct = req.headers['content-type'] && req.headers['content-type'].split(';')[0];

	function done(err, body) {
		cb(err, body);
	}
	switch(ct) {
		case 'application/json':
			extractBody(req, function(err, body) {
				done(err, JSON.parse(body));
			});
		break;
		default:
			cb(new Error('Bad content type, supports: `' + ['application/json'].join('`, `') + '`'));
	}
}

function API(dbPath) {
	// only 1 store per dbPath atm...
	this.todos = new Store(dbPath, 'todos');
}

API.prototype.respondWithJSON = function respondWithJSON(res, data, statusOverride, headerOverrides) {
	var json = JSON.stringify(data, null, DEV ? '\t' : '');

	this.respond(res, JSON.stringify(json), statusOverride, extend({
		'Content-Type': 'application/json'
	}, headerOverrides));
};

API.prototype.respondWithError = function respondWithError(res, err, status) {
	var msg = err instanceof Error ? err.message : err;
	this.respondWithJSON(res, {message: msg}, status || 400);
};

API.prototype.respond = function respond(res, str, statusOverride, headerOverrides) {
	if (!res) {
		throw new Error('Missing response');
	}
	var headers = extend({
		'Content-Length': Buffer.byteLength(str || '')
	}, headerOverrides);
	var status = statusOverride || 200;
	if (status > 399) {
		res.writeHead(status, 'error', headers);
	} else {
		res.writeHead(status, 'success', headers);
	}

	res.end(str);
};

API.prototype.hook = function hook(op, req, res) {
	var cmds = op.replace(/^\//, '').split('/');
	var id = cmds[0];
	var type = req.method.toLowerCase();
	var self = this;

	switch(type) {
		case 'post':
			// search
			processBody(req, function(err, data) {
				if (err) {
					console.error(err);
					return self.respondWithError(res, err);
				}
				self.todos.find(data, function(error, found) {
					if (error) {
						console.error(error);
						return self.respondWithError(res, error, 500);
					}
					self.respondWithJSON(res, found);
				});
			});
		break;
		case 'get':
			if (id) {
				self.todos.findOne(id, function(err, data) {
					if (err) {
						return self.respondWithError(res, err, 404);
					}
					self.respondWithJSON(res, data);
				});
			} else {
				self.todos.findAll(function(err, data) {
					if (err) {
						console.error(err);
						return self.respondWithError(res, err);
					}
					self.respondWithJSON(res, data);
				});
			}
		break;
		case 'put':
			processBody(req, function(err, body) {
				if (err) {
					console.error(err);
					return self.respondWithError(res, err);
				}
				self.todos.insert(body, function(err, record) {
					if (err) {
						console.log(err);
						return self.respondWithError(res, err);
					}
					self.respondWithJSON(res, record);
				});
			});
		break;
		case 'patch':
			if (!id) {
				self.respondWithError(res, 'missing id data from url fragment');
			} else {
				self.todos.findOne(id, function(err, record) {
					if (err) {
						console.error(err);
						return self.respondWithError(res, err, 404);
					}
					processBody(req, function(err, body) {
						if (err) {
							console.error(err);
							return self.respondWithError(res, err);
						}
						self.todos.update(id, extend(record, body), function(err, record) {
							if (err) {
								console.error(err);
								return self.respondWithError(res, err);
							}
							self.respondWithJSON(res, record);
						});
					});
				});
			}
		break;
		case 'delete':
			if (id) {
				self.todos.remove(id, function(err, record) {
					if (err) {
						console.error(err);
						return self.respondWithError(res, err);
					}
					self.respondWithJSON(res, record);
				});
			} else {
				self.todos.removeAll(function(err, record) {
					if (err) {
						console.error(err);
						return self.respondWithError(res, err);
					}
					self.respondWithJSON(res, record);
				});
			}
		break;
		default:
			self.respondWithError(res, 'not found', 404);
	}
};

module.exports = API;