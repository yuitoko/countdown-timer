'use strict';
const cookieHandler = require('./cookie-handler');
const util = require('./handler-util');

function route(req, res) {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] === 'http') {
    util.handleNotFound(req, res);
  }
  switch (req.url) {
    case '/events':
      cookieHandler.handle(req, res);
      break;
    case '/events/delete':
      cookieHandler.handleDelete(req, res);
      break;
    case '/events/pin':
      cookieHandler.handlePin(req, res);
      break;
    case '/favicon.ico':
      util.handleFavicon(req, res);
      break;
    case '/icon.png':
      util.handleIconImage(req, res);
      break;
    case '/style.css':
      util.handleStyleCssFile(req, res);
      break;
    case '/countdown-timer.js':
      util.handleCountDownTimerJsFile(req, res);
      break;
    default:
      util.handleNotFound(req, res);
      break;
  }
}

module.exports = {
  route
};