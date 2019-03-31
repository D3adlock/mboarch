/**
domain.data {
  <roomName> : {
    "password": <password>,
    "players": [
      {
        "name":<name>, 
        "id":<id>,
        "ws":<ws>, 
        "offline":<true/false>, 
        "coords": {
          "room": <roomName>,
          "index": <index>
        }
      }
    ]
  }
}
**/

const crypto = require('crypto');
const conf = require('./conf.js');

class Domain {

  constructor() {
    this.rooms = {};
  }

  //
  // ROOM
  //

  createRoom(roomName, password) {
    var room = {};
    room.players = {};
    room.password = password;
    room.name = roomName;
    this.rooms[roomName] = room;
  }

  // findCallback(roomName,roomData)
  getRoom(findCallback) {
    for (var roomName in this.rooms){
      if (findCallback(this.rooms[roomName])) {
        return this.rooms[roomName];
      }
    }
  }

  tryToDeleteRoom(roomName) {
    if (Object.keys(domain.rooms[roomName].players).length === 0) {
      delete this.rooms[roomName];
    }
  }

  //
  // PLAYER
  //

  addPlayer(playerName, ws, roomName) {
    var player = {};
    player.name = playerName
    player.id = generateId();
    player.ws = ws;
    player.offline = false;
    player.room = roomName;
    this.rooms[roomName].players[playerName] = player;
    return this.rooms[roomName].players[playerName];
  }

  deletePlayer(playerName, roomName) {
    delete this.rooms[roomName].players[playerName];
  }

  // callback(playerName,playerData)
  getPlayer(findCallback) {
    for (var roomName in this.rooms){
      for (var playerName in this.rooms[roomName].players){
        if(findCallback(this.rooms[roomName].players[playerName])) {
          return this.rooms[roomName].players[playerName];
        }
      }
    }
  }

  //
  // VERIFICATION
  //

  noMoreRoomsAllowed() {
    return Object.keys(domain.rooms).length < conf.maxRooms ? false : true;
  }

  isRoomFull(roomName) {
    return Object.keys(domain.rooms[roomName].players).length < conf.maxPlayersPerRoom ? false : true;
  }

  //
  // HIGH LEVEL QUERIES
  //

  getAnyAvailableRoom(previousRoom) {
    return this.getRoom((room) => {
      return (!this.isRoomFull(room.name) && room.password === undefined && room.name !== previousRoom);
    });
  }

  //
  // TRANSFORMATION
  //

  getRoomInfoForResponse(roomName) {

    var room = {};
    room.hasPassword = this.rooms[roomName].password ? true : false;
    room.name = roomName;
    room.players = {};

    for (var playerName in this.rooms[roomName].players) {
      room.players[playerName] = {
        'name':this.rooms[roomName].players[playerName].name,
        'offline':this.rooms[roomName].players[playerName].offline
      };
    }

    return room;
  }
}

var generateId = () => {
  var sha = crypto.createHash('sha256');
  sha.update(Math.random().toString());
  return sha.digest('hex').toString();
}

var domain = new Domain();

module.exports = domain;