const BaseService = require('./base-service.js');
const domain = require('../domain.js');
const conf = require('../conf.js');

class UpdateService extends BaseService {

  removePlayerFromPreviousRoom() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      if (actionReq.playerInfo) {
        this.roomBroadcast(actionReq.playerInfo.room,
          {'action':'playerLeft','value':actionReq.playerInfo.name}, actionReq.playerInfo.name)
        domain.deletePlayer(actionReq.playerInfo.name, actionReq.playerInfo.room);
        domain.tryToDeleteRoom(actionReq.playerInfo.room);
      }
      return actionReq;
    }
  }

  createNewRoom() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      domain.createRoom(actionReq.roomName, actionReq.roomPassword);
      return actionReq;
    }
  }

  addPlayerToRoom() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}

      var player;
      var brodcastAction = 'playerJoin';
      var sendAction = 'joinSucc';
      if (actionReq.action === 'rejoin') {
        brodcastAction = 'playerRejoin';
        sendAction = 'rejoinSucc';
        player = actionReq.playerInfo;
        player.offline = false;
        player.ws = actionReq.ws;
      } else {
        // adds the player to the room
        player = domain.addPlayer(actionReq.name, actionReq.ws, actionReq.roomName);
      }

      this.roomBroadcast(player.room,
          {'action':brodcastAction,'value':player.name}, player.name);

      var serializableRoom = domain.getRoomInfoForResponse(player.room);
      this.send(player.ws,
      {
        'action':sendAction,
        'value': { 
          'room':serializableRoom,
          'playerName':player.name,
          'playerId': player.id
        }
      });
      actionReq.player = player;
      return actionReq;
    }
  }

  sendPeerDesc() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      this.send(actionReq.targetPlayerInfo.ws, {
        'action':'peerConn', 
        'value': {
          'from': actionReq.playerInfo.name, 
          'desc':actionReq.peerDesc
        }
      });
      return actionReq;
    }
  }

  // not pipeble action
  setPlayerOffline(player) {
    this.roomBroadcast(player.room,
      {'action':'playerOffline','value':player.name}, player.name)
    player.offline = true;
    setTimeout(() => {
      if (player.offline) {
        var actionReq = {};
        actionReq.failed = false;
        actionReq.playerInfo = player;
        this.removePlayerFromPreviousRoom()(actionReq);
      }
    }, conf.offlineTimeoutSecs*1000);
  }
}

var updateService = new UpdateService();
module.exports = updateService;
