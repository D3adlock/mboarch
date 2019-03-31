const checkService = require('./service/check-service.js');
const updateService = require('./service/update-service.js');

class Controller {

  joinRoom(data) {
    return this.pipe(
      checkService.getActionReq(),
      checkService.getPlayerInfo(),
      checkService.validatePlayerName(),
      checkService.validateRoomVsPreviousRoom(),
      checkService.validateJoiningRoomAvailability(),
      updateService.removePlayerFromPreviousRoom(),
      updateService.addPlayerToRoom()
    )(data).player;
  }

  joinAnyRoom(data) {
    return this.pipe(
      checkService.getActionReq(),
      checkService.getPlayerInfo(),
      checkService.validatePlayerName(),
      checkService.validateRoomVsPreviousRoom(),
      checkService.getAvailableRoomForPlayer(),
      updateService.removePlayerFromPreviousRoom(),
      updateService.addPlayerToRoom()
    )(data).player;
  }

  rejoin(data) {
    return this.pipe(
      checkService.getActionReq(),
      checkService.getPlayerInfo(),
      checkService.validateRejoiningRoom(),
      updateService.addPlayerToRoom()
    )(data).player;
  }

  createRoom(data) {
    return this.pipe(
      checkService.getActionReq(),
      checkService.getPlayerInfo(),
      checkService.validatePlayerName(),
      checkService.validateRoomVsPreviousRoom(),
      checkService.validateNewRoom(),
      updateService.removePlayerFromPreviousRoom(),
      updateService.createNewRoom(),
      updateService.addPlayerToRoom()
    )(data).player;
  }

  peerConn(data) {
    return this.pipe(
      checkService.getActionReq(),
      checkService.getPlayerInfo(),
      checkService.validateOriginTarget(),
      updateService.sendPeerDesc()
    )(data).player;
  }

  onPlayerDisconnect(player) {
    updateService.setPlayerOffline(player);
  }

  pipe(...functions) {
    return (value) => {
      return functions.reduce((currentValue, currentFunction) => {
        // console.log(currentFunction.name);
        var result = currentFunction(currentValue);
        // if (result.playerInfo) {
        //   console.log(result.playerInfo.offline);
        // }
        return result;
      }, value);
    }
  }
}

var controller = new Controller();
module.exports = controller;
