const controller = require('./controller.js');
const WebSocket = require('ws');

class WsServer {

  constructor(conf) {
    this.wss = new WebSocket.Server({ port: conf.wsPort });

    this.wss.on("connection", function(ws){

        var player;

        ws.on("message",(msg) => {
            try {
              var msgObject = JSON.parse(msg);
              msgObject.value.ws = ws;
              var _player = controller[msgObject.action](msgObject);
              player = _player ? _player : player;
            } catch(err) {console.log(err);}
        });

        ws.on("close",(msg) => {
          if (player) {
            controller.onPlayerDisconnect(player);
          }
        });
    }.bind(this));
  }
}

module.exports = WsServer;
