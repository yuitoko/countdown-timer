'use strict';
const pug = require('pug');
const fs = require('node:fs');
const Cookies = require('cookies');

function handleFavicon(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/vnd.microsoft.icon',
    'Cache-Control': 'public, max-age=604800'
  });
  const favicon = fs.readFileSync('./favicon.ico');
  res.end(favicon);
}

function handleIconImage(req, res) {
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=604800'
  });
  const file = fs.readFileSync('./icon.png');
  res.end(file);
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/css',
  });
  const file = fs.readFileSync('./public/style.css')
  res.end(file)
}

function handleCountDownTimerJsFile(req, res) {
  res.writeHead(200, {
    'Content-Type': 'application/javascript; charset=utf-8'
  })
  const file = fs.readFileSync('./public/countdown-timer.js');
  res.end(file);
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/404.pug'));
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('400 Bad Request');
}

function handleDateError(req, res) {
  res.writeHead(400, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(pug.renderFile('./views/date-error.pug'));
}

module.exports = {
  handleFavicon,
  handleIconImage,
  handleStyleCssFile,
  handleCountDownTimerJsFile,
  handleNotFound,
  handleBadRequest,
  handleDateError,
}