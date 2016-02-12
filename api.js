var Store = require('./store');

function extend(a, b) {
	var ab = {};
	Object.keys(a).concat(Object.keys(b)).forEach(function() {});
}

function API(dbPath) {
	this.todos = new Store(dbPath, 'todos');

	this.hook = this.hook.bind(this);
}

API.prototype.respondWithJSON = function respondWithJSON(headerOverrides, data, res) {
	var overrides = headerOverrides || {};
	var headers = {
		status: 200,
		'Content-Type': 'application/json'
	};
};

API.prototype.hook = function hook(op, req, res) {
	var cmds = op.split('/');
	var type = cmds[0];

	switch(type) {
		case 'get':
		break;
		case 'create':
		break;
		case 'put':
		break;
	}
};

module.exports = API;