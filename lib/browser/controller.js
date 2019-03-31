const PeerConn = require('./peer-conn.js');
const cookiesMng = require('./cookies-mng.js');
const conf = require('./conf.js');
const domain = require('./domain.js');

class Controller {

  //
  // ACTIONS FROM CLIENT
  //

  connect() {
    this.msgs = []; // queue the messages from the server
    this.wsConn = new WebSocket(conf.wsUrl);
    this.wsConn.onopen = (event) => conf.onConnectionOpen(event);
    this.wsConn.onclose = (event) => conf.onConnectionClose(event);
    this.onmessage();
  }

  createRoom(roomName, playerName, roomPassword) {
    var createRoomReq = {};
    createRoomReq.action = 'createRoom';
    createRoomReq.value = {};
    createRoomReq.value.roomName = roomName;
    createRoomReq.value.roomPassword = roomPassword;
    createRoomReq.value.playerName = playerName;
    createRoomReq.value.playerId = cookiesMng.getPlayerId();
    this.send(createRoomReq);
  }

  joinRoom(roomName, playerName, roomPassword) {
    var joinRoomReq = {};
    joinRoomReq.action = 'joinRoom';
    joinRoomReq.value = {};
    joinRoomReq.value.playerName = playerName;
    joinRoomReq.value.roomName = roomName;
    joinRoomReq.value.roomPassword = roomPassword;
    joinRoomReq.value.playerId = cookiesMng.getPlayerId();
    this.send(joinRoomReq);
  }

  joinAnyRoom(playerName) {
    var joinAnyRoomReq = {};
    joinAnyRoomReq.action = 'joinAnyRoom';
    joinAnyRoomReq.value = {};
    joinAnyRoomReq.value.playerName = playerName;
    joinAnyRoomReq.value.playerId = cookiesMng.getPlayerId();
    this.send(joinAnyRoomReq);
  }

  rejoin() {
    var rejoinReq = {};
    rejoinReq.action = 'rejoin';
    rejoinReq.value = {};
    rejoinReq.value.playerId = cookiesMng.getPlayerId();
    this.send(rejoinReq);
  }

  sendPeerConn(target, desc) {
    var connReq = {};
    connReq.action = 'peerConn';
    connReq.value = {};
    connReq.value.target = target;
    connReq.value.desc = desc;
    connReq.value.playerId = cookiesMng.getPlayerId();
    this.send(connReq);
  }

  sendMsg(target,obj) {
    var error = 'send msg to player: invalid target';
    if (domain.getPlayer(target) === undefined) {conf.onError(error);return;}
    if (domain.getPlayer(target).peerConn === undefined) {conf.onError(error);return;}
    if (domain.getPlayer(target).peerConn.state !== 'open') {conf.onError(error);return;}
    var msg = {};
    msg.from = domain.data.playerName;
    msg.value = obj;
    domain.getPlayer(target).peerConn.send(JSON.stringify(msg));
  }

  broadcast(obj) {
    var players = domain.getPlayers();
    if (players) {
      for( var playerName in players) {
        if (playerName != domain.data.playerName) {
          this.sendMsg(playerName,obj);
        }
      }
    }
  }

  //
  // ACTIONS FROM SERVER
  //

  joinSucc(data) {
    domain.setDomain(data);
    conf.onJoinSucc(data);
    this.messageProcessed();
  }

  rejoinSucc(data) {
    domain.setDomain(data);
    conf.onRejoinSucc(data);
    this.messageProcessed();
  }

  playerJoin(data) {
    domain.addPlayer(data);
    this.sendPeerConnOffer(data,conf.onPlayerJoin);
  }

  playerRejoin(data) {
    domain.setPlayerBackOnline(data);
    this.sendPeerConnOffer(data,conf.onPlayerRejoin);
  }

  playerOffline(data) {
    domain.setPlayerOffline(data);
    conf.onPlayerOffline(data);
    this.messageProcessed();
  }

  playerLeft(data) {
    domain.playerLeft(data);
    conf.onPlayerLeft(data);
    this.messageProcessed();
  }

  peerConn(data) {
    var offerFrom = domain.data.room.players[data.from];
    var offer = data.desc;

    if (offer.sdp.type === 'offer') {
      offerFrom.peerConn = new PeerConn(offerFrom.name);
      offerFrom.peerConn.acceptOffer(offer).then((desc) => this.sendPeerConn(offerFrom.name, desc));
    } else if (offer.sdp.type === 'answer'){
      offerFrom.peerConn.acceptOffer(offer);
    }

    offerFrom.peerConn.onMessage((msg) => {
      conf.onMsgFromPlayer(msg);
    });

    // call back when a connection is open
    offerFrom.peerConn.onConnectionOpen((player) => {
      conf.onPeerConn('connection to ' + player + ' open');
      domain.getPlayer(player).peerConn.state = 'open';
      this.messageProcessed();
    });

    offerFrom.peerConn.onDisconnectedOrClosed((reason) => {
      conf.onPeerConn('connection to ' + offerFrom.name + ' closed');
    });

    offerFrom.peerConn.onOfferAcceptError((reason) => {
      conf.onPeerConn('connected to ' + offerFrom.name + ' failed');
      conf.onPeerConn(reason);
      this.messageProcessed();
    });
  }

  error(data) {
    conf.onError(data);
    this.messageProcessed();
  }

  //
  // UTILS
  //

  onmessage() {
    this.wsConn.onmessage = (msg) => {
      try {
        var msgObject = JSON.parse(msg.data);
        msgObject.ws = this.wsConn;
        this.push(msgObject);
      } catch(err) {console.log(err);}
    }
  }

  send(obj) {
    if (this.wsConn == undefined) {return;}
    if (this.wsConn.readyState != WebSocket.OPEN) { return;}
    this.wsConn.send(JSON.stringify(obj));
  }

  sendPeerConnOffer(data, notifyerMethod) {
    // when player join it send the peerConn request
    var target = domain.getPlayer(data)
    target.peerConn = new PeerConn(target.name);
    if (!target.offline) {
      target.peerConn.createOffer().then((desc) => {
        this.sendPeerConn(target.name, desc);
        this.messageProcessed();
        notifyerMethod(data);
      });
    }
  }

  //
  // QUEUE
  //

  push(data) {
    this.msgs.push(data);
    if (this.msgs.length === 1) {
      this.excecuteNext();
    }
  }

  excecuteNext() {
    if (this.msgs.length > 0) {
      this[this.msgs[0].action](this.msgs[0].value);
    }
  }

  messageProcessed() {
      this.msgs.splice(0,1);
      this.excecuteNext();
  }
}

var controller = new Controller();
module.exports = controller;
