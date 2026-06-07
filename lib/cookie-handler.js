'use strict';
const pug = require('pug');
const Cookies = require('cookies');
const util = require('./handler-util');

const crypto = require('node:crypto');

function handle(req, res) {
  const cookies = new Cookies(req, res);
  switch (req.method) {
    case 'GET':
      const pinnedSlot = cookies.get('pinnedSlot') || '1';
      const eventList = [null, null, null];

      for (let i = 1; i <= 3; i++) {
        const savedEvent = cookies.get(`event${i}`);
        if (savedEvent) {
          try {
            const parsed = JSON.parse(decodeURIComponent(savedEvent));
            eventList[i-1] = parsed;
          } catch (e) {
            eventList[i-1] = null;
          }
        }
      }

      let pinnedEvent = eventList[parseInt(pinnedSlot) - 1];
      if (!pinnedEvent) {
        pinnedEvent = eventList.find(event => event !== null) || null;
      }

      const oneTimeToken = crypto.randomBytes(8).toString('hex');
      
      cookies.set('token', oneTimeToken, {
        httpOnly: true,
        path: '/',
        sameSite: 'strict'
      });

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net;" + 
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com;" +
          "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com;" +
          "connect-src 'self' https://cdn.jsdelivr.net;" +
          "img-src 'self' data:;"
      });

      res.end(pug.renderFile('./views/events.pug', {
        eventList,
        pinnedEvent,
        oneTimeToken
      }));

      console.info(
        `[閲覧されました]\n` +
        `> remoteAddress: ${req.socket.remoteAddress}\n` +
        `> userAgent: ${req.headers['user-agent']}`
      );
      break;
    case 'POST':
      const body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        const dataString = Buffer.concat(body).toString();
        const params = new URLSearchParams(dataString);

        const requestedOneTimeToken = params.get('oneTimeToken');
        const cookieToken = cookies.get('token')

        if (cookieToken !== requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }

        const title = params.get('title');
        const date = params.get('date');
        const slot = params.get('slot');
        const slotNum = parseInt(slot, 10);

        if (!title || title.trim() === '' || title.length > 30) {
          handleRedirectEvents(req, res);
          return;
        }
        if (!date || isNaN(Date.parse(date))) {
          util.handleBadRequest(req, res);
          return;
        }
        if (!slot || isNaN(slotNum) || slotNum < 1 || slotNum > 3) {
          util.handleBadRequest(req, res);
          return;
        }

        const eventData = {
          title,
          date
        };

        const targetMs = Date.parse(date);
        const currentMs = Date.now();
        const remainingMs = targetMs - currentMs;

        if (remainingMs <= 0) {
          util.handleDateError(req, res);
          return;
        }

        const maxAge = remainingMs + (60 * 60 * 24 * 1000);

        cookies.set(`event${slot}`, encodeURIComponent(JSON.stringify(eventData)), {
          maxAge,
          path: '/',
          httpOnly: true,
          sameSite: 'strict'
        });

        handleRedirectEvents(req, res);
        console.info(
          `[設定されました]\n` +
          `> イベント名：${title}\n` +
          `> 目標日時：${date}`
        );
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectEvents(req, res) {
  res.writeHead(303, {
    'Location': '/events'
  });
  res.end();
}

function handleDelete(req, res) {
  const cookies = new Cookies(req, res);
  switch (req.method) {
    case 'POST':
      const body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        const dataString = Buffer.concat(body).toString();
        const params = new URLSearchParams(dataString);

        const requestedOneTimeToken = params.get('oneTimeToken');
        const cookieToken = cookies.get('token')

        if (cookieToken !== requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }

        const slot = params.get('slot');
        const slotNum = parseInt(slot, 10);

        if (!slot || isNaN(slotNum) || slotNum < 1 || slotNum > 3) {
          util.handleBadRequest(req, res);
          return;
        }

        cookies.set(`event${slot}`, '', {
          maxAge: 0,
          path: '/',
          httpOnly: true,
          sameSite: 'strict'
        });

        console.info(
          `[削除されました]\n` +
          `> イベント${slot}` +
          `> remoteAddress: ${req.socket.remoteAddress}\n` +
          `> userAgent: ${req.headers['user-agent']}`
        );

        handleRedirectEvents(req, res);
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handlePin(req, res) {
  const cookies = new Cookies(req, res);
  switch (req.method) {
    case 'POST':
      const body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        const dataString = Buffer.concat(body).toString();
        const params = new URLSearchParams(dataString);

        const requestedOneTimeToken = params.get('oneTimeToken');
        const cookieToken = cookies.get('token')

        if (cookieToken !== requestedOneTimeToken) {
          util.handleBadRequest(req, res);
          return;
        }

        const slot = params.get('slot');
        const slotNum = parseInt(slot, 10);

        if (!slot || isNaN(slotNum) || slotNum < 1 || slotNum > 3) {
          util.handleBadRequest(req, res);
          return;
        }

        const targetEventCookie = cookies.get(`event${slot}`);

        let maxAge = 60 * 60 * 1000;

        if (targetEventCookie) {
          try {
            const eventData = JSON.parse(decodeURIComponent(targetEventCookie));
            const targetMs = Date.parse(eventData.date);
            const currentMs = Date.now();
            const remainingMs = targetMs - currentMs;

            if (remainingMs <= 0) {
              util.handleBadRequest(req, res);
              return;
            }

            maxAge = remainingMs + (60 * 60 * 3 * 1000);
          } catch (e) {
            // 初期値のまま進む
          }
        }

        cookies.set('pinnedSlot', slot, {
          maxAge,
          path: '/',
          httpOnly: true,
          sameSite: 'strict'
        });

        console.info(
          `[ピン留めされました] イベント${slot}\n` +
          `> remoteAddress: ${req.socket.remoteAddress}\n` +
          `> userAgent: ${req.headers['user-agent']}`
        );
        handleRedirectEvents(req, res);
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

module.exports = {
  handle,
  handleDelete,
  handlePin,
};