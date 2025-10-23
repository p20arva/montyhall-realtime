// server.js
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ['GET','POST'] }
});

const ADMIN_KEY = (process.env.ADMIN_KEY || 'montyhost').trim();
const adminIo = io.of('/admin');

// Middleware έλεγχος για admin namespace
adminIo.use((socket, next) => {
  // IP από X-Forwarded-For (αν υπάρχει) ή από το socket
  const xff = socket.handshake.headers['x-forwarded-for'];
  const candidate = (Array.isArray(xff) ? xff[0] : (xff || '')).split(',')[0].trim();
  const ipRaw =
    candidate ||
    socket.handshake.address ||
    socket.request?.connection?.remoteAddress ||
    '';

  if (!isLocalIpString(ipRaw)) return next(new Error('forbidden ip'));

  const { key } = socket.handshake.auth || {};
  if (key !== ADMIN_KEY) return next(new Error('unauthorized'));

  next();
});

// μετά τον ορισμό του adminIo:
adminIo.on('connection', (socket) => {
  socket.emit('globalStats', packBroadcast()); // στείλε snapshot στον νέο admin client
  socket.on('resetGlobalStats', () => {
    globalStats.total = 0;
    globalStats.playSwitch = 0;
    globalStats.playStay = 0;
    globalStats.winSwitch = 0;
    globalStats.winStay = 0;
    io.emit('globalStats', packBroadcast());        // σε όλους
    adminIo.emit('globalStats', packBroadcast());   // και στο admin
  });
});

// --- Trust proxy για σωστό req.ip αν μπει πίσω από reverse proxy (Nginx κ.λπ.) ---
app.set('trust proxy', true);

// --- Helpers για local IP ---
function normalizeIp(str='') {
  return String(str).replace('::ffff:', '');
}
function isLocalIpString(ip) {
  const n = normalizeIp(ip);
  return n === '127.0.0.1' || n === '::1' || n === 'localhost';
}
function isLocalRequest(req) {
  const xff = req.headers['x-forwarded-for'];
  const candidate = (Array.isArray(xff) ? xff[0] : (xff || '')).split(',')[0].trim();
  const ip = normalizeIp(candidate || req.ip || req.connection?.remoteAddress || '');
  return isLocalIpString(ip);
}
// Μάζεψε τις local IPv4 διευθύνσεις του server (π.χ. 192.168.1.213)
const localIfaces = os.networkInterfaces();
const LOCAL_IPS = new Set(
  Object.values(localIfaces).flat().filter(Boolean)
    .filter(n => n.family === 'IPv4' && !n.internal)
    .map(n => n.address)
);

// Δίνει true αν η IP του αιτήματος είναι loopback ή μία από τις LOCAL_IPS
function isHostClient(req) {
  const xff = req.headers['x-forwarded-for'];
  const candidate = (Array.isArray(xff) ? xff[0] : (xff || '')).split(',')[0].trim();
  const ip = normalizeIp(candidate || req.ip || req.connection?.remoteAddress || '');
  return isLocalIpString(ip) || LOCAL_IPS.has(ip);
}

// Admin page ΜΟΝΟ για host
app.get('/admin.html', (req, res) => {
  if (!isLocalRequest(req)) return res.status(403).type('text/plain').send('Forbidden');
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Επιστρέφει flags για UI (αν ο caller είναι ο host)
app.get('/__flags', (req, res) => {
  res.json({
    isHost: isHostClient(req)
  });
});

// 1) Σέρβιρε τα αρχεία από τον φάκελο όπου βρίσκεται το server.js (και το MontyHall.html)
app.use(express.static(__dirname));

// 2) Προαιρετικό: κάνε το "/" να ανοίγει ρητά το MontyHall.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'MontyHall.html'));
});

// ---- Realtime state ----
const globalStats = {
  total: 0,
  playSwitch: 0,
  playStay: 0,
  winSwitch: 0,
  winStay: 0,
};

const pct = (a, b) => (b ? (a / b * 100) : 0);

function packBroadcast() {
  const { total, playSwitch, playStay, winSwitch, winStay } = globalStats;
  const wins = winSwitch + winStay;
  const losses = Math.max(0, total - wins);
  // sockets στο default namespace "/"
  const activePlayers = io.of('/').sockets.size;
  return {
    total,
    playSwitch,
    playStay,
    winSwitch,
    winStay,
    winRateSwitch: pct(winSwitch, playSwitch),
    loseRateSwitch: pct(playSwitch - winSwitch, playSwitch),
    winRateStay: pct(winStay, playStay),
    loseRateStay: pct(playStay - winStay, playStay),
    winRateTotal: pct(wins, total),
    loseRateTotal: pct(losses, total),
    activePlayers,
    lastUpdate: new Date().toISOString(),
  };
}

function applyBatch({ k = 0, wS = 0, wT = 0, cS = 0, cT = 0 }) {
  globalStats.total += k;
  globalStats.winSwitch += wS;
  globalStats.winStay += wT;
  globalStats.playSwitch += cS;
  globalStats.playStay += cT;
}

io.on('connection', (socket) => {
  // Στείλε snapshot στον νέο client
  socket.emit('globalStats', packBroadcast());
  // ενημέρωσε και το admin για αλλαγή στους active players
  adminIo.emit('globalStats', packBroadcast());

  // Ενός γύρου (interactive ή playOneAuto)
  socket.on('roundResult', ({ win, strategy }) => {
    const inc = {
      k: 1,
      wS: (strategy === 'switch' && win) ? 1 : 0,
      wT: (strategy === 'stay' && win) ? 1 : 0,
      cS: (strategy === 'switch') ? 1 : 0,
      cT: (strategy === 'stay') ? 1 : 0,
    };
    applyBatch(inc);
    io.emit('globalStats', packBroadcast());
    adminIo.emit('globalStats', packBroadcast());
  });

  // Μαζικό update για auto-sim batches
  socket.on('batchResults', ({ k, wS, wT, cS, cT }) => {
    applyBatch({ k, wS, wT, cS, cT });
    io.emit('globalStats', packBroadcast());
    adminIo.emit('globalStats', packBroadcast());
  });

  // Προαιρετικό reset από οποιονδήποτε client
  socket.on('resetGlobalStats', () => {
    globalStats.total = 0;
    globalStats.playSwitch = 0;
    globalStats.playStay = 0;
    globalStats.winSwitch = 0;
    globalStats.winStay = 0;
    io.emit('globalStats', packBroadcast());
    adminIo.emit('globalStats', packBroadcast());
  });

  socket.on('disconnect', () => {
    // ώστε να ανανεωθεί το Active players στο admin
    adminIo.emit('globalStats', packBroadcast());
  });
});

const PORT = process.env.PORT || 5500;
// Άκου σε όλα τα interfaces για να παίζουν συσκευές στο LAN
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MontyHall realtime backend on http://0.0.0.0:${PORT}`);
});
