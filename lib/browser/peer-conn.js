class PeerConn {
  constructor(targetPlayerName) {
    this.conn;
    this.channel;
    this.localDesc = {};
    this.remoteDesc = {};
    this.iceReadyChecker;
    this.OFFER = 'offer';

    this.targetPlayerName = targetPlayerName;
    this.conn = new RTCPeerConnection();
    this.conn.onicecandidate = (event) => { 
      if(event.candidate != null) {this.localDesc.ice = event.candidate;}
    };

    this.conn.ondatachannel = (event) => {
      this.receiveChannel = event.channel;
      this.receiveChannel.onmessage = this.gotMessage.bind(this);
    };

    this.conn.onsignalingstatechange = (event) => {
      if(event.currentTarget.signalingState === 'closed') {
        this.disconnectedOrClosed(this.targetPlayerName);
      }
    };

    this.conn.oniceconnectionstatechange = (event) => {
      if ( event.currentTarget.iceConnectionState === 'disconnected') {
        this.disconnectedOrClosed(this.targetPlayerName);
      }
    };

    this.channel = this.conn.createDataChannel('sendDataChannel', {reliable:true})
    this.channel.onopen = () => this.connectionOpen(this.targetPlayerName);
    this.channel.onclose = () => this.conn.close();
    this.channel.onerror = (event) => this.conn.close();
  }

  // returns the offer promise
  createOffer() {
    return this.conn.createOffer()
      .then((offer) => { return this.conn.setLocalDescription(offer);})
      .then(this.returnDescPromiceOnceIceSet.bind(this))
      .catch((reason) => {this.offerAcceptError(reason);});
  }

  acceptOffer(offer) {
    this.remoteDesc = offer;
    return this.conn.setRemoteDescription(new RTCSessionDescription(offer.sdp))
    .then(() => {
        if (offer.sdp.type == this.OFFER) { return this.conn.createAnswer(); } 
        else { return Promise.resolve();}
    }).then((answer) => {
        if (offer.sdp.type == this.OFFER) {return this.conn.setLocalDescription(answer);}
        else {return Promise.resolve();}
    }).then(() => {
      if (offer.sdp.type == this.OFFER) {this.conn.addIceCandidate(new RTCIceCandidate(offer.ice));}
      return Promise.resolve();
    }).then(this.returnDescPromiceOnceIceSet.bind(this))
    .catch(function(reason) {this.offerAcceptError(reason)});
  }

  send(msg) {this.channel.send(msg);}
  onDisconnectedOrClosed(callback) {this.disconnectedOrClosed = callback;}
  onConnectionOpen(callback) {this.connectionOpen = callback;}
  onOfferAcceptError(callback) {this.offerAcceptError = callback;}
  onMessage(callback) {this.gotMessage = callback;}

  //
  // UTIL
  //

  returnDescPromiceOnceIceSet() {
    this.localDesc.sdp = this.conn.localDescription;
    return new Promise(function(resolve, reject) {
      this.iceReadyChecker = setInterval(function() {
        if (this.localDesc.ice != null) {
          clearInterval(this.iceReadyChecker);
          resolve(this.localDesc);
        }
      }.bind(this), 50);
    }.bind(this));
  }

  disconnectedOrClosed(targetPlayerName){ console.log('disconnected or closed from ' + targetPlayerName);}
  connectionOpen(player){console.log('connected to: ' + player);}
  gotMessage(msg){ console.log(msg);}
  offerAcceptError(reason) {console.log(reason);}
}

module.exports = PeerConn;
