const BaseService = require('./base-service.js');
const domain = require('../domain.js');

class CheckService extends BaseService {

  getActionReq() {
    return (data) => {
      var actionReq = {};
      actionReq.action = data.action;
      actionReq.roomName = data.value.roomName;
      actionReq.roomPassword = data.value.roomPassword;
      actionReq.name = data.value.playerName;
      actionReq.id = data.value.playerId;
      actionReq.ws = data.value.ws;
      actionReq.failed = false;
      actionReq.targetPlayerName = data.value.target;
      actionReq.peerDesc = data.value.desc;
      return actionReq;
    }
  }

  getPlayerInfo() {
    return (actionReq) => {
      actionReq.playerInfo = domain.getPlayer((player) => {
        return player.id === actionReq.id;
      });
      return actionReq;
    }
  }

  getAvailableRoomForPlayer() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}

      var previousRoom;
      if (actionReq.playerInfo) {
        previousRoom = actionReq.playerInfo.room;
      }
      var availableRoom = domain.getAnyAvailableRoom(previousRoom);
      if (availableRoom === undefined) {
        this.sendError(actionReq.ws, 'no available rooms at the momment');
        actionReq.failed = true;
      } else {
        actionReq.roomName = availableRoom.name;
      }
      return actionReq;
    }
  }

  validatePlayerName() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}

      //check player name format
      if (!/[a-zA-Z0-9]{4,10}/i.test(actionReq.name)) {
        this.sendError(actionReq.ws, 'name has to be 4 to 10 alphanumeric characters.');
        actionReq.failed = true;
        return actionReq;
      }

      var playerWithSameName = domain.getPlayer((player) => {
        return player.name === actionReq.name && player.id !== actionReq.id;
      });
      if (playerWithSameName) { 
        this.sendError(actionReq.ws, 'player name is already taken');
        actionReq.failed = true;
      }
      return actionReq;
    };
  }

  validateRoomVsPreviousRoom() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      var checkPreviousRoom = actionReq.playerInfo !== undefined;

      if (checkPreviousRoom) {
        var invalidRoom = checkPreviousRoom && actionReq.playerInfo.room === actionReq.roomName;
        
        if (invalidRoom) {
          this.sendError(actionReq.ws, 'invalid room');
          actionReq.failed = true;
        }
      }
      return actionReq;
    }
  }

  validateNewRoom() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}

      //check room name format
      if (!/[a-zA-Z0-9]{4,10}/i.test(actionReq.roomName)) {
        this.sendError(actionReq.ws, 'room name has to be 4 to 10 alphanumeric characters.');
        actionReq.failed = true;
        return actionReq;
      }

      // check if the room he wants to create is valid
      if (domain.noMoreRoomsAllowed()) { 
        this.sendError(actionReq.ws, 'no more rooms allowed');
        actionReq.failed = true; 
        return actionReq;
      }
      // check if the room is already created
      if (domain.rooms[actionReq.roomName]) { 
        this.sendError(actionReq.ws, 'room name already exists');
        actionReq.failed = true; 
      }
      return actionReq;
    }
  }

  validateRejoiningRoom() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      
      if (actionReq.playerInfo === undefined) {
        this.sendError(actionReq.ws, 'could not rejoin');
        actionReq.failed = true; 
        return actionReq;
      }
      // check if the room still exists
      if (domain.rooms[actionReq.playerInfo.room] === undefined) { 
        this.sendError(actionReq.ws, 'your previous room no longer exists');
        actionReq.failed = true; 
      }
      return actionReq;
    }
  }

  validateJoiningRoomAvailability() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      // check if the target room is valid
      var targetRoom = domain.rooms[actionReq.roomName];

      if (targetRoom === undefined) { 
        this.sendError(actionReq.ws, 'invalid room name or password');
        actionReq.failed = true;
        return actionReq;
      }

      if (targetRoom.password !== actionReq.roomPassword &&  targetRoom.password !== undefined) {
        this.sendError(actionReq.ws, 'invalid room name or password');
        actionReq.failed = true;
        return actionReq;
      }

      if (domain.isRoomFull(actionReq.roomName)) { 
        this.sendError(actionReq.ws, 'room is full');
        actionReq.failed = true;
      }
      return actionReq;
    }
  }

  validateOriginTarget() {
    return (actionReq) => {
      if (actionReq.failed) {return actionReq;}
      
      // check if origin exist
      if (actionReq.playerInfo === undefined) {
        this.sendError(actionReq.ws, 'error on conecting to ' + actionReq.targetPlayerName);
        actionReq.failed = true;
        return actionReq;
      }

      //check if target exists
      var targetPlayer = domain.rooms[actionReq.playerInfo.room].players[actionReq.targetPlayerName];
      if (targetPlayer === undefined ) {
        this.sendError(actionReq.ws, 'target player invalid');
        actionReq.failed = true;
        return actionReq;
      }

      // check if the target is valid (same room)
      if (targetPlayer.room !== actionReq.playerInfo.room) {
        this.sendError(actionReq.ws, 'target player invalid');
        actionReq.failed = true;
      }

      actionReq.targetPlayerInfo = targetPlayer;
      return actionReq;
    }
  }
}

var checkService = new CheckService();
module.exports = checkService;
