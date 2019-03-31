/**
{
  "room": {
    "hasPassword":false,
    "name":"perro",
    "players": {
      "lala": {
        "name":"lala",
        "offline":false,
        "peerConn": <peerConnObject>
      }
    }
  },
  "playerName":"lala",
  "playerId":"7cbcd5bd158aa700588321455f6d5fb6ee9339ff521bde7fa6854b8764e4f441"
}
**/

const cookiesMng = require('./cookies-mng.js');

class Domain {
  constructor() {
    this.data = {};
  }

  setDomain(data) {
    this.data = data;
    cookiesMng.setPlayerId(this.data.playerId);
  }

  addPlayer(playerName, offline) {
    if (this.data) {
      this.data.room.players[playerName] = {'name':playerName,'offline':false};
    }
  }

  setPlayerOffline(playerName) {
    if (this.data) {
      this.data.room.players[playerName].offline = true;
      this.data.room.players[playerName].peerConn.conn.close();
      delete this.data.room.players[playerName].peerConn;
    }
  }

  setPlayerBackOnline(playerName) {
    if (this.data) {
      this.data.room.players[playerName].offline = false;
      this.data.room.players[playerName].peerConn.conn.close();
    } 
  }

  playerLeft(playerName) {
    if (this.data) {
      delete this.data.room.players[playerName];
    }
  }

  getPlayer(playerName) {
    if (this.data) {
      return this.data.room.players[playerName];
    }
  }

  getPlayers() {
    return this.data.room.players;
  }
}

var domain = new Domain();

module.exports = domain;
