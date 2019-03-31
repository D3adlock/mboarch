var browserConf = require('./conf.js');

var cookiesMng = {};

if (browserConf.enablePersistentSession) {
  cookiesMng.setPlayerId = (value) => {
      var expires = "";
      var date = new Date();
      date.setTime(date.getTime() + (browserConf.cookieExpirationTimeInHours*60*60*1000));
      expires = "; expires=" + date.toUTCString();
      document.cookie = browserConf.cookieName + "=" + (value || "")  + expires + "; path=/";
  }

  cookiesMng.getPlayerId = () => {
      var nameEQ = browserConf.cookieName + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
  }
} else {
  cookiesMng.setPlayerId = undefined;

  cookiesMng.setPlayerId = (value) => {
      cookiesMng.setPlayerId = value;
  }

  cookiesMng.getPlayerId = () => {
      return cookiesMng.setPlayerId;
  }

  cookiesMng.erasePlayerId = () => {   
      document.cookie = browserConf.cookieName+'=; Max-Age=-99999999;';  
  } 
}

module.exports = cookiesMng;