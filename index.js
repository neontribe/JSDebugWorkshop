var http = require('http');
var url = require('url');
var fs = require('fs');

var API = require('./api');

var config = require('./package.json').todo;
var port = config.port || 9898;

// Adding client static files to be picked up later
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
	'/res/base.css'		: fs.readFileSync('./client/res/base.css'),
	'/res/bug.png'		: fs.readFileSync('./client/res/bug.png'),
};
var validStatic = Object.keys(staticFiles);

// respond with static files with the correct mime type
function closeWithStatic(path, res) {
	var file = staticFiles[path];
	var type = {
		'html': 'text/html',
		'js': 'application/x-javascript',
		'css': 'text/css',
		'png': 'image/png'
	}[path.split('.').pop()];

	res.writeHead(200, {
		'Content-Length': Buffer.byteLength(file),
		'Content-Type': type
	});

	res.end(file);
}

var api = new API(config.dbPath);

var server = http.createServer(function(req, res) {
	// handle static file requests
	var requested = url.parse(req.url);
	var path = requested.path === '/' ? '/index.html' : requested.path;
	if (validStatic.indexOf(path) > -1) {
		return closeWithStatic(path, res);
	}

	if (path === '/favicon.ico') {
		res.writeHead(200);
		return res.end();
	}

	// hook our api at /api
	if (path.startsWith('/api')) {
		// this is where the API will take over handling this request
		return api.hook(path.replace(/^\/api/, ''), req, res);
	}

	// default to a 404
	res.writeHead(404, 'not found');
	res.end();
});

server.listen(port, function() {
	console.log('Listening on localhost:' + port);
});
