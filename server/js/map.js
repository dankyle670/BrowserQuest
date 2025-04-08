var cls = require('./lib/class'),
    fs = require('fs'),
    _ = require('underscore'),
    Utils = require('./utils'),
    Checkpoint = require('./checkpoint');

module.exports = Map = cls.Class.extend({
    init: function (filepath) {
        var self = this;

        this.isLoaded = false;

        fs.access(filepath, fs.constants.F_OK, function (err) {
            if (err) {
                console.error(filepath + " doesn't exist.");
                return;
            }

            fs.readFile(filepath, function (err, file) {
                if (err) {
                    console.error("Error reading map file:", err);
                    return;
                }

                try {
                    var json = JSON.parse(file.toString());
                    self.initMap(json);
                } catch (e) {
                    console.error("Invalid JSON in map file:", e);
                }
            });
        });
    },

    initMap: function (map) {
        this.width = map.width;
        this.height = map.height;
        this.collisions = map.collisions;
        this.mobAreas = map.roamingAreas;
        this.chestAreas = map.chestAreas;
        this.staticChests = map.staticChests;
        this.staticEntities = map.staticEntities;
        this.isLoaded = true;

        this.zoneWidth = 28;
        this.zoneHeight = 12;
        this.groupWidth = Math.floor(this.width / this.zoneWidth);
        this.groupHeight = Math.floor(this.height / this.zoneHeight);

        this.initConnectedGroups(map.doors);
        this.initCheckpoints(map.checkpoints);

        if (this.ready_func) {
            this.ready_func();
        }
    },

    ready: function (f) {
        this.ready_func = f;
    },

    tileIndexToGridPosition: function (tileNum) {
        tileNum -= 1;
        var x = (tileNum % this.width);
        var y = Math.floor(tileNum / this.width);
        return { x: x, y: y };
    },

    GridPositionToTileIndex: function (x, y) {
        return (y * this.width) + x + 1;
    },

    generateCollisionGrid: function () {
        this.grid = [];

        if (this.isLoaded) {
            var tileIndex = 0;
            for (var i = 0; i < this.height; i++) {
                this.grid[i] = [];
                for (var j = 0; j < this.width; j++) {
                    this.grid[i][j] = _.include(this.collisions, tileIndex) ? 1 : 0;
                    tileIndex += 1;
                }
            }
        }
    },

    isOutOfBounds: function (x, y) {
        return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
    },

    isColliding: function (x, y) {
        if (this.isOutOfBounds(x, y)) {
            return false;
        }
        return this.grid[y][x] === 1;
    },

    GroupIdToGroupPosition: function (id) {
        var posArray = id.split('-');
        return pos(parseInt(posArray[0]), parseInt(posArray[1]));
    },

    forEachGroup: function (callback) {
        for (var x = 0; x < this.groupWidth; x++) {
            for (var y = 0; y < this.groupHeight; y++) {
                callback(x + '-' + y);
            }
        }
    },

    getGroupIdFromPosition: function (x, y) {
        var gx = Math.floor((x - 1) / this.zoneWidth);
        var gy = Math.floor((y - 1) / this.zoneHeight);
        return gx + '-' + gy;
    },

    getAdjacentGroupPositions: function (id) {
        var self = this;
        var position = this.GroupIdToGroupPosition(id);
        var x = position.x;
        var y = position.y;

        var list = [
            pos(x - 1, y - 1), pos(x, y - 1), pos(x + 1, y - 1),
            pos(x - 1, y), pos(x, y), pos(x + 1, y),
            pos(x - 1, y + 1), pos(x, y + 1), pos(x + 1, y + 1)
        ];

        if (this.connectedGroups[id]) {
            _.each(this.connectedGroups[id], function (connectedPos) {
                if (!_.any(list, function (groupPos) {
                    return equalPositions(groupPos, connectedPos);
                })) {
                    list.push(connectedPos);
                }
            });
        }

        return _.reject(list, function (p) {
            return p.x < 0 || p.y < 0 || p.x >= self.groupWidth || p.y >= self.groupHeight;
        });
    },

    forEachAdjacentGroup: function (groupId, callback) {
        if (groupId) {
            _.each(this.getAdjacentGroupPositions(groupId), function (pos) {
                callback(pos.x + '-' + pos.y);
            });
        }
    },

    initConnectedGroups: function (doors) {
        var self = this;
        this.connectedGroups = {};

        _.each(doors, function (door) {
            var groupId = self.getGroupIdFromPosition(door.x, door.y);
            var connectedGroupId = self.getGroupIdFromPosition(door.tx, door.ty);
            var connectedPos = self.GroupIdToGroupPosition(connectedGroupId);

            if (self.connectedGroups[groupId]) {
                self.connectedGroups[groupId].push(connectedPos);
            } else {
                self.connectedGroups[groupId] = [connectedPos];
            }
        });
    },

    initCheckpoints: function (cpList) {
        var self = this;
        this.checkpoints = {};
        this.startingAreas = [];

        _.each(cpList, function (cp) {
            var checkpoint = new Checkpoint(cp.id, cp.x, cp.y, cp.w, cp.h);
            self.checkpoints[checkpoint.id] = checkpoint;
            if (cp.s === 1) {
                self.startingAreas.push(checkpoint);
            }
        });
    },

    getCheckpoint: function (id) {
        return this.checkpoints[id];
    },

    getRandomStartingPosition: function () {
        var nbAreas = this.startingAreas.length;
        var i = Utils.randomInt(0, nbAreas - 1);
        var area = this.startingAreas[i];
        return area.getRandomPosition();
    }
});

var pos = function (x, y) {
    return { x: x, y: y };
};

var equalPositions = function (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
};
