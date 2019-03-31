var fs = require('fs');
var browserify = require('browserify');
var WsServer = require('./ws-server.js');
var conf = require('./conf.js');

class Mborch {
  constructor(userConf) {
    if (userConf)
      for(var key in userConf) {this.setConfig(userConf, key);}

    this.writeClient(__dirname + '/browser/mborch.js', conf.browserLibPath, 'Mborch');
    this.wss = new WsServer({wsPort: conf.wsPort});
  }

  writeClient(browserifyInput, browserifyOutput, mainClass) {
    var bundleFs = fs.createWriteStream(browserifyOutput);
    var b = browserify();
    if (mainClass)
      b = browserify({standalone: mainClass});
    b.add(path);
    b.bundle().pipe(bundleFs);
  }

  setConfig(userConf, configName) {
    conf[configName] = userConf[configName] ? userConf[configName] : conf[configName];
  }
}

module.exports = Mborch;
