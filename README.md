# Mborch

Mborch (Multiplayer Browser Orchestrator) gives you a server and browser side API to easily implement multiplayer web games with peer to peer communication between players.

## Components

* A websocket server (powered by the ws library) to work as coordinator and signaling server.
* A browser side javascript API to manage the server connection and the peer to peer communication.

## Server Side API

### Server Side API Features

The main class (Mborch) on instantiation will start a ws server publishing the below services trough the ws server:

* `create a new room` any player can create a room if the number of rooms in the server has not reached the limit
* `join to room` any player can join to a specific room if it has the name/password and the number of players in the room has not reached the limit
* `join to any room` any player can join to any available room, a room is available if it doesn't have a password and the number of players in the room has not reached the limit
* `rejoin` if a player accidentally disconnects, it can return to its previous room. There is a offline timeout to finally remove the player from the server
* (TODO) `kick player` ability to kick a determine player from a room by other players votation
* No room clean up required, rooms are deleted once the last player on it leaves
* For players and rooms names the restriction is given by the regex /[azA-Z0-9]{4,10}/

The Mborch class also provide the below public methods

* `writeClient(browserifyInput, browserifyOutput, mainClass)` where main class is optional in case you don't want to publish a standAlone class 

### Server Side API Configuration

The main class constructor accepts a configuration object to define the below parameters

* `maxPlayersPerRoom` the limit of players per room
* `maxRooms` the limit of rooms per server
* `browserLibPath` the path where Mborch will create the browser lib file
* `wsPort` the port for the ws server
* `offlineTimeoutSecs` the max time in seconds a player could be offline before get removed from server
* (TODO) `browserLibMin` flag to create the browser lib file in its min format

### Server Side API Usage

```
var Mborch = require('mborch');

var mborch = new Mborch({
  maxPlayersPerRoom: 5,
  maxRooms: 10,
  browserLibPath: 'public/mborch.js', 
  wsPort: 8080,
  offlineTimeoutSecs: 60
});
```
On instantiation, the `mborch` object will start the ws server and it will write the browser library to `public/mborch.js`

## Browser Side API

### Browser Side API Features

The browser side library will offer a layer of abstraction to consume the ws server. The mail class again will be Mborch but this time publishing the below methods.

* `connect()` start the connection with the ws server, this doesn't create any element in the server domain
* `createRoom(roomName, playerName, roomPassword)` creates a new room in the server
* `joinRoom(roomName, playerName, roomPassword)` joins to an existing room
* `joinAnyRoom(playerName)` join to any available room in the server
* `rejoin()` helps to reconnect a player to its previous room if the player is still in the offline time window
* `sendMsg(target,msgObj)` send a message to another player in the room trough peer connection
* `broadcast(msg)` broadcast a message to all the players in the room trhough peer connection
* `getDomain()` gets the current domain object that the browser side keeps updated with the server internally

### Browser Side API Configuration

The browser api will provide all the event callbacks assignment using a configuration object which can be passed as a parameter on its instantiation. Below are the supported variables

* `onCreateRoomSucc` function called when player creates a new room, updates the domain object with the room and player info
* `onJoinSucc` function called when player joins an existing room, updates the domain object with the room and player info
* `onRejoinSucc` function called when player rejoins to its previous room after disconnect, updates the domain object with the room and player info
* `onPlayerJoin` function called when a new player enters to the current room, updates the domain object with the room info
* `onPlayerRejoin` function called when a new player get rejoin to the current room, updates the domain object with the room info
* `onPeerConn` function called when a peer connection has any update (connect, close, disconnect etc)
* `onMsgFromPlayer` function called when one player sends a message trough peer comunication
* `onPlayerOffline` function called when a player disconnect from the server and enters in the offline state
* `onPlayerLeft` function called when a player is removed from the server due to offline timeout
* `onError` function called when server returns an error instead of the expected result
* `onConnectionOpen` function called when the browser lib gets connected to the ws server
* `onConnectionClose` function called when the browser lib gets disconnected from the ws server
* `wsUrl` variable to set the wsUrl of the ws server
* `cookieName` variable to set the name of the cookie to be stored in the browser for player reconnection scenario
* `cookieExpirationTimeInHours` variable to set the duration of the cookie to be stored in the browser for player reconnection scenario
* `enablePersistentSession` if true, store the player session in the coockies this is required to enable the rejoin when player is in offline state

### Browser Side API Usage
```
<script type="text/javascript" src="/mborch.js"></script>
<script type="text/javascript" src="/require.min.js"></script>

<script type="text/javascript">
  window.onload = () => {

    var out = document.getElementById('out');
    
    var mborch = new Mborch({
      onConnectionOpen: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onConnectionOpen - ' + JSON.stringify(v),
      onConnectionClose: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onConnectionClose - ' + JSON.stringify(v),
      onCreateRoomSucc: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onCreateRoomSucc - ' + JSON.stringify(v),
      onJoinSucc: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onJoinSucc - ' + JSON.stringify(v),
      onRejoinSucc: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onRejoinSucc - ' + JSON.stringify(v),
      onPlayerJoin: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onPlayerJoin - ' + JSON.stringify(v),
      onMsgFromPlayer: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onMsgFromPlayer - ' + JSON.stringify(v.data),
      onPlayerRejoin: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onPlayerRejoin - ' + JSON.stringify(v),
      onPlayerOffline: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onPlayerOffline - ' + JSON.stringify(v),
      onPlayerLeft: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onPlayerLeft - ' + JSON.stringify(v),
      onPeerConn: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onPeerConn - ' + JSON.stringify(v),
      onError: (v) => out.innerHTML = out.innerHTML+'<br><br>'+'onError - ' + JSON.stringify(v),
      wsUrl: 'ws://localhost:8080',
      cookieExpirationTimeInHours: 24
    });

</script">
<input id="input" type="text" autofocus>
```

## Licenses

MIT
