var http = require('http');
var url = require('url');
var fs = require('fs');

var API = require('./api');

var config = require('./package.json').todo;
var port = config.port || 9898;

var staticFiles = {
	'/index.html'		: fs.readFileSync('./client/index.html'),
	'/js/helpers.js'	: fs.readFileSync('./client/js/helpers.js'),
	'/js/controller.js'	: fs.readFileSync('./client/js/controller.js'),
	'/js/store.js'		: fs.readFileSync('./client/js/store.js'),
	'/js/model.js'		: fs.readFileSync('./client/js/model.js'),
	'/js/template.js'	: fs.readFileSync('./client/js/template.js'),
	'/js/view.js'		: fs.readFileSync('./client/js/view.js'),
	'/js/app.js'		: fs.readFileSync('./client/js/app.js'),
	'/res/index.css'	: fs.readFileSync('./client/res/index.css'),
	'/res/base.js'		: fs.readFileSync('./client/res/base.js'),
	'/res/base.css'		: fs.readFileSync('./client/res/base.css')
};
var validStatic = Object.keys(staticFiles);

function closeWithStatic(path, res) {
	var file = staticFiles[path];
	var type = {
		'html': 'text/html',
		'js': 'application/x-javascript',
		'css': 'text/css'
	}[path.split('.').pop()];

	res.writeHead(200, {
		'Content-Length': file.length,
		'Content-Type': type
	});

	res.end(file);
}

var api = new API(config.dbPath);

var server = http.createServer(function(req, res) {
	var requested = url.parse(req.url);
	var path = requested.path === '/' ? '/index.html' : requested.path;
	if (validStatic.indexOf(path) > -1) {
		return closeWithStatic(path, res);
	}

	// api paths?
	if (path.startsWith('/api')) {
		return api.hook(path.replace(/^\/api/, ''), req, res);
	}
});

server.listen(port, function() {
	console.log('Listening on localhost:' + port);
});