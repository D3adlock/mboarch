var conf = require('./conf.js');
const controller = require('./controller.js');
const domain = require('./domain.js');

class Mborch {

  constructor(userConf) {
    if (userConf) 
      for(var key in userConf) {this.setConfig(userConf, key);}
  }

  connect() {controller.connect();}
  createRoom(roomName, playerName, roomPassword) {
    controller.createRoom(roomName, playerName, roomPassword);}
  joinRoom(roomName, playerName, roomPassword) {
    controller.joinRoom(roomName, playerName, roomPassword);}
  joinAnyRoom(playerName) {controller.joinAnyRoom(playerName);}
  rejoin() {controller.rejoin();}
  sendMsg(target,msg) {controller.sendMsg(target,msg);}
  broadcast(msg) {controller.broadcast(msg);}
  getDomain(msg) {return domain;}

  //
  // UTILS
  //

  setConfig(userConf, confName) {
    conf[confName] = userConf[confName] ? userConf[confName] : conf[confName];
  }
}

module.exports = Mborch;
