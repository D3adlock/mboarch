const domain = require('../domain.js');
const WebSocket = require('ws');

class BseService {

  send(ws, obj) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  }

  sendError(ws, errorMsg) {
    var error = {};
    error.action = 'error';
    error.value = errorMsg;
    this.send(ws, error);
  }

  roomBroadcast(roomName, obj, exclude) {
    for(var playerName in domain.rooms[roomName].players) {
      if (exclude !== playerName) {
        this.send(domain.rooms[roomName].players[playerName].ws, obj);
      }
    }
  }
}

module.exports = BseService;
