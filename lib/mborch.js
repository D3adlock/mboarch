var fs = require('fs');
var browserify = require('browserify');
var WsServer = require('./ws-server.js');
var conf = require('./conf.js');

class Mborch {
  constructor(userConf) {
    if (userConf)
      for(var key in userConf) {this.setConfig(userConf, key);}

    this.writeClient('Mborch',__dirname + '/browser/mborch.js');
    this.wss = new WsServer({wsPort: conf.wsPort});
  }

  writeClient(mainClass,path) {
    var bundleFs = fs.createWriteStream(conf.browserLibPath);
    var b = browserify({standalone: mainClass});
    b.add(path);
    b.bundle().pipe(bundleFs);
  }

  setConfig(userConf, configName) {
    conf[configName] = userConf[configName] ? userConf[configName] : conf[configName];
  }
}

module.exports = Mborch;
