define(['player', 'entityfactory', 'lib/bison', 'types', './handlers'], function(Player, EntityFactory, BISON, Types, Handlers) {

    var GameClient = Class.extend({
        init: function(host, port) {
            this.connection = null;
            this.host = host;
            this.port = port;

            this.connected_callback = null;
            this.spawn_callback = null;
            this.movement_callback = null;

            this.useBison = true; // Active la compression BISON
            this.isListening = true;

            this.handlers = {};
            for (let key in Handlers) {
                this.handlers[key] = Handlers[key].bind(this);
            }

            this.enable();

            this.lastPosition = { x: 0, y: 0 }; // Stocke la dernière position pour éviter les envois inutiles
        },

        enable: function() {
            this.isListening = true;
        },

        disable: function() {
            this.isListening = false;
        },

        connect: function(dispatcherMode) {
            var url = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.hostname + ":81/";
            var self = this;

            log.info("Trying to connect to server : " + url);

            this.connection = window.MozWebSocket ? new MozWebSocket(url) : new WebSocket(url);

            if (dispatcherMode) {
                this.connection.onmessage = function(e) {
                    var reply = JSON.parse(e.data);
                    if (reply.status === 'OK') {
                        self.dispatched_callback(reply.host, reply.port);
                    } else {
                        alert("BrowserQuest error: " + reply.status);
                    }
                };
            } else {
                this.connection.onopen = function() {
                    log.info("Connected to server " + self.host + ":" + self.port);
                };

                this.connection.onmessage = function(e) {
                    if (e.data === "go") {
                        if (self.connected_callback) self.connected_callback();
                        return;
                    }
                    if (e.data === 'timeout') {
                        self.isTimeout = true;
                        return;
                    }
                    self.receiveMessage(e.data);
                };

                this.connection.onerror = function(e) {
                    log.error(e, true);
                };

                this.connection.onclose = function() {
                    log.debug("Connection closed");
                    $('#container').addClass('error');
                    if (self.disconnected_callback) {
                        const message = self.isTimeout
                            ? "You have been disconnected for being inactive for too long"
                            : "The connection to BrowserQuest has been lost";
                        self.disconnected_callback(message);
                    }
                };
            }

            // Ajout du mécanisme de ping pour maintenir la connexion active
            setInterval(() => {
                if (this.connection && this.connection.readyState === WebSocket.OPEN) {
                    this.connection.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);  // Ping toutes les 30 secondes
        },

        sendMessage: function(json) {
            if (this.connection.readyState === 1) {
                const data = this.useBison ? BISON.encode(json) : JSON.stringify(json);
                this.connection.send(data);
            }
        },

        receiveMessage: function(message) {
            if (!this.isListening) return;
            const data = this.useBison ? BISON.decode(message) : JSON.parse(message);
            log.debug("data: " + message);
            if (Array.isArray(data[0])) {
                this.receiveActionBatch(data);
            } else {
                this.receiveAction(data);
            }
        },

        receiveAction: function(data) {
            const action = data[0];
            const handler = this.handlers[action];
            if (handler && typeof handler === 'function') {
                handler(data);
            } else {
                log.error("Unknown action : " + action);
            }
        },

        receiveActionBatch: function(actions) {
            actions.forEach(action => this.receiveAction(action));
        },

        // Fonction optimisée pour l'envoi de la position du joueur
        sendPosition: function(newX, newY) {
            if (Math.abs(newX - this.lastPosition.x) > 1 || Math.abs(newY - this.lastPosition.y) > 1) {
                const positionData = { x: newX, y: newY };
                this.sendMessage({ type: 'MOVE', data: positionData });
                this.lastPosition = positionData;  // Mise à jour de la dernière position
            }
        }
    });

    return GameClient;
});
