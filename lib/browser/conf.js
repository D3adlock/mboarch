var browserConf = {};

browserConf.onCreateRoomSucc = (data) => {console.log('onCreateRoomSucc:');console.log(data);}
browserConf.onJoinSucc = (data) => {console.log('onJoinSucc:');console.log(data);}
browserConf.onRejoinSucc = (data) => {console.log('onRejoinSucc:');console.log(data);}
browserConf.onPlayerJoin = (data) => {console.log('onPlayerJoin:');console.log(data);}
browserConf.onPlayerRejoin = (data) => {console.log('onPlayerRejoin:');console.log(data);}
browserConf.onPeerConn = (data) => {console.log('onPeerConn:');console.log(data);}
browserConf.onMsgFromPlayer = (data) => {console.log('onMsgFromPlayer:');console.log(data);}
browserConf.onPlayerOffline = (data) => {console.log('onPlayerOffline:');console.log(data);}
browserConf.onPlayerLeft = (data) => {console.log('onPlayerLeft:');console.log(data);}
browserConf.onError = (data) => {console.log('onError:');console.log(data);}
browserConf.onConnectionOpen = (data) => {console.log('onConnectionOpen:');console.log(data);}
browserConf.onConnectionClose = (data) => {console.log('onConnectionClose:');console.log(data);}
browserConf.wsUrl = 'ws://localhost:8080';
browserConf.cookieName = 'mborch';
browserConf.cookieExpirationTimeInHours = 24;
browserConf.autoPeerConn = true;
browserConf.enablePersistentSession = true;

module.exports = browserConf;
