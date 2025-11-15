

// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const mentionRoutes = require('./routes/mentions');
const spikeDetector = require('./services/spikeDetector');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

// attach io for routes/services
app.set('io', io);

app.use('/api/mentions', mentionRoutes);

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/brandtrack';

mongoose.connect(MONGO, { autoIndex: true }).then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log('Backend listening on', PORT));
  spikeDetector.start(io);
}).catch(err => {
  console.error('Mongo connection error', err);
});

app.get('/health', (req, res) => res.json({ ok: true }));
