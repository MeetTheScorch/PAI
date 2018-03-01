var fs = require('fs');
var http = require('http');
var path = require('path');
var mime = require('mime');
var Cookies = require('cookies');
var uuid = require('uuid');
var WebSocket = require('ws');

var debugLog = true;
var initDB = true; // set to false to suppress DB initialization

var sessions = {};

function serveFile(rep, fileName, errorCode, message) {
	
	if(debugLog) console.log('Serving file ' + fileName + (message ? ' with message \'' + message + '\'': ''));
	
    fs.readFile(fileName, function(err, data) {
		if(err) {
            serveError(rep, 404, 'Document ' + fileName + ' not found');
        } else {
			rep.writeHead(errorCode, message, { 'Content-Type': mime.getType(path.basename(fileName)) });
			if(message) {
				data = data.toString().replace('{errMsg}', rep.statusMessage).replace('{errCode}', rep.statusCode);
			}
			rep.end(data);
        }
      });
}

if(!debugLog) process.on('uncaughtException', function (err) {
	console.log('\nRUNTIME ERROR\n\n' + err + '\n\nexiting...');
	process.exit(1);
});

function serveError(rep, error, message) {
	serveFile(rep, 'html/error.html', error, message);
}

var db = require('./db.js');

if(initDB) {
	require('./initialize.js');
}

function logIn(req, rep, session) {
	var item = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk) {
		item += chunk;
	}).on('end', function() {
		var cred = JSON.parse(item);
		if(debugLog) console.log('Trying to log in ' + JSON.stringify(cred));
		db.checkCredentials(cred, function(user) {
			if(user) {
				if(session) {
					delete user.password;
					sessions[session].user = user;
				}
				rep.writeHead(200, 'Login successful', { 'Content-Type': 'application/json' });
				rep.end(JSON.stringify(user));
				if(debugLog) console.log('User ' + JSON.stringify(user) + ' logged in');
				broadcast(session, 'User ' + user.firstName + ' ' + user.lastName + ' logged in');
			} else {
				rep.writeHead(401, 'Login failed', { 'Content-Type': 'application/json' });
				rep.end(JSON.stringify( { login: cred.login } ));
				if(debugLog) console.log(JSON.stringify(cred) + ' are not valid credentials');
			}	
		});
	});
}

function logOut(req, rep, session) {
	if(debugLog) console.log('Destroying session ' + session + ': ' + JSON.stringify(sessions[session]));
	rep.writeHead(200, 'Session destroyed', { 'Content-Type': 'application/json' });
	rep.write(JSON.stringify(sessions[session]));
	if(session) {
	    if(sessions[session].user) {
			var user = sessions[session].user;
			broadcast(session, 'User ' + user.firstName + ' ' + user.lastName + ' logged out');
	    }
		delete sessions[session].user;
	}
	rep.end();
}

function whoAmI(req, rep, session) {
	rep.writeHead(200, 'Session info', { 'Content-Type': 'application/json' });
	if(session) {
		var sess = sessions[session];
		sess.id = session;
		rep.end(JSON.stringify(sess));
	} else {
		rep.end(JSON.stringify({}));		
	}
}

var listeningPort = 8888;

var httpServer = http.createServer();
var wsServer = new WebSocket.Server({ server: httpServer });

httpServer.on('request', function (req, rep) {
	
	if(debugLog) console.log('HTTP request URL: ' + req.method + ' ' + req.url);

	var cookies = new Cookies(req, rep);
	var session = cookies.get('session');
	var now = Date.now();
	if(!session || !sessions[session]) {
		session = uuid();
		sessions[session] = { created: now, touched: now, user: null };
		cookies.set('session', session, { httpOnly: false });
		console.log('Creating new session ' + session);
	} else {
		sessions[session].touched = now;
		cookies.set('session', session, { httpOnly: false });
	}

	switch(req.url) {
		case '/':
			serveFile(rep, 'html/index.html', 200, '');
			break;
		case '/favicon.ico':
			serveFile(rep, 'img/favicon.ico', 200, '');
			break;
		case '/auth':
			switch(req.method) {
				case 'GET':
					whoAmI(req, rep, session);
					break;
				case 'POST':
					logIn(req, rep, session);
					break;
				case 'DELETE':
					logOut(req, rep, session);
					break;
				default:
					serveError(rep, 405, 'Method not allowed');
			}
			break;
		default:
			if(/^\/(html|css|js|fonts|img)\//.test(req.url)) {
				var fileName = path.normalize('./' + req.url);
				if(fileName.endsWith('.map')) {
					serveError(rep, 403, 'No map files used');
				} else {
					//console.log(sessions[session]);
					serveFile(rep, fileName, 200, '');
				}
			} else if(/^\/db\//.test(req.url)) {
					var args = req.url.split("/").slice(2).filter(function (element) { return element.length > 0 });
					if(args.length < 1)
						serveError(rep, 403, 'Access denied');
					else {
						switch(req.method) {
							case 'GET':		db.select(req, rep, args); break;
							case 'POST':	db.insert(req, rep, args); break;
							case 'PUT':		db.update(req, rep, args); break;
							case 'DELETE':	db.remove(req, rep, args); break;
							default:		db.error(rep, 405, 'Method not allowed');
						}
					}
			} else {	
				serveError(rep, 403, 'Access denied');
			}
		}
	}
);

wsServer.on('connection', function connection(conn) {
	
	if(debugLog) console.log('WebSocket connection initialized');
  
	conn.on('message', function(message) {
		
		var rep = { error: 'OK' };
		try {
			
			msg = JSON.parse(message);
			if(debugLog) console.log('Frontend sent by ws: ' + JSON.stringify(msg));
			
			if(msg.session && !conn.session) {
				conn.session = msg.session;
				if(debugLog) console.log('WebSocket session set to ' + conn.session);
			}
			
		} catch(err) {
			rep.error = err;
		}
		conn.send(JSON.stringify(rep));
		if(debugLog) console.log('My answer sent by ws: ' + JSON.stringify(rep));
	
	}).on('error', function(err) {});
});

function broadcast(session, msg) {
	if(debugLog) console.log('Broadcasting: ' + session + ' -> ' + msg);
	wsServer.clients.forEach(function(client) {
		if(client.readyState === WebSocket.OPEN && client.session != session) {
			if(debugLog) console.log("Sending an event message to client " + client.session + " with data " + msg);
			client.send(JSON.stringify({ from: session, message: msg }));
		}
	});
}

httpServer.listen(listeningPort);

if(debugLog) console.log('Listening on port ' + listeningPort);