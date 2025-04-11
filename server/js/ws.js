const cls = require("./lib/class");
const url = require('url');
const WebSocket = require('websocket').server;
const http = require('http');
const Utils = require('./utils');
const _ = require('underscore');

const WS = {};
module.exports = WS;

const Server = cls.Class.extend({
    init: function (port) {
        this.port = port;
        this.pingInterval = 30000;  // Intervalle de ping en ms (30 secondes)
        this.pingTimeout = 5000;    // Timeout pour attendre le pong (5 secondes)
    },
    onConnect: function (callback) {
        this.connection_callback = callback;
    },
    onError: function (callback) {
        this.error_callback = callback;
    },
    broadcast: function (message) {
        throw "Not implemented";
    },
    forEachConnection: function (callback) {
        _.each(this._connections, callback);
    },
    addConnection: function (connection) {
        this._connections[connection.id] = connection;
    },
    removeConnection: function (id) {
        delete this._connections[id];
    },
    getConnection: function (id) {
        return this._connections[id];
    },

    // Fonction pour envoyer un ping régulièrement
    startPingPong: function () {
        const self = this;
        setInterval(() => {
            self.forEachConnection((connection) => {
                connection.send({ type: 'ping' });
                connection.pingTime = Date.now();
            });
        }, this.pingInterval);
    },

    // Fonction pour vérifier les connexions inactives
    checkInactiveConnections: function () {
        const self = this;
        setInterval(() => {
            self.forEachConnection((connection) => {
                if (Date.now() - connection.pingTime > self.pingTimeout) {
                    console.log(`Closing inactive connection: ${connection.id}`);
                    connection.close("Inactive connection");
                    self.removeConnection(connection.id);
                }
            });
        }, this.pingTimeout);
    }
});

const Connection = cls.Class.extend({
    init: function (id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
        this.pingTime = Date.now();
    },
    onClose: function (callback) {
        this.close_callback = callback;
    },
    listen: function (callback) {
        this.listen_callback = callback;
    },
    broadcast: function (message) {
        throw "Not implemented";
    },
    send: function (message) {
        const data = JSON.stringify(message);
        this.sendUTF8(data);
    },
    sendUTF8: function (data) {
        this._connection.sendUTF(data);
    },
    close: function (logError) {
        console.log("Closing connection to " + this._connection.remoteAddress + ". Error: " + logError);
        this._connection.close();
    }
});

WS.MultiVersionWebsocketServer = Server.extend({
    _connections: {},
    _counter: 0,

    init: function (port) {
        this._super(port);
        const self = this;

        this._httpServer = http.createServer((request, response) => {
            const path = url.parse(request.url).pathname;
            
            if (path === '/status' && self.status_callback) {
                response.writeHead(200);
                response.write(self.status_callback());
            } else if (path === '/health') {
                response.writeHead(200, { 'Content-Type': 'text/plain' });
                response.end('OK');
                return;
            } else {
                response.writeHead(404);
                response.end();
            }
        });        
        
        this._httpServer.listen(port, () => {
            console.log("Server is listening on port " + port);
        });

        this._wsServer = new WebSocket({
            httpServer: this._httpServer,
            autoAcceptConnections: false
        });

        this._wsServer.on('request', (request) => {
            const connection = request.accept(null, request.origin);
            const c = new WS.WebSocketConnection(self._createId(), connection, self);

            if (self.connection_callback) {
                self.connection_callback(c);
            }

            self.addConnection(c);
        });

        // Start ping pong and check for inactive connections
        this.startPingPong();
        this.checkInactiveConnections();
    },

    _createId: function () {
        return '5' + Utils.random(99) + '' + (this._counter++);
    },

    broadcast: function (message) {
        this.forEachConnection((connection) => {
            connection.send(message);
        });
    },

    onRequestStatus: function (status_callback) {
        this.status_callback = status_callback;
    }
});

WS.WebSocketConnection = Connection.extend({
    init: function (id, connection, server) {
        this._super(id, connection, server);
        const self = this;

        this._connection.on('message', (message) => {
            if (self.listen_callback && message.type === 'utf8') {
                try {
                    const parsed = JSON.parse(message.utf8Data);
                    self.listen_callback(parsed);

                    // Vérifier le ping pong
                    if (parsed.type === 'pong') {
                        self.pingTime = Date.now();
                    }
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        self.close("Received message was not valid JSON.");
                    } else {
                        throw e;
                    }
                }
            }
        });

        this._connection.on('close', () => {
            if (self.close_callback) self.close_callback();
            delete self._server._connections[self.id];
        });
    }
});
