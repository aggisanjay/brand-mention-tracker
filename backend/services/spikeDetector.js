
// services/spikeDetector.js
const Mention = require('../models/Mention');
const Alert = require('../models/Alert');
const cron = require('node-cron');

const WINDOW = 60;
let history = [];

function median(arr) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x,y)=>x-y);
  const m = Math.floor(a.length/2);
  return a.length % 2 ? a[m] : (a[m-1] + a[m]) / 2;
}

async function countLastMinute() {
  const since = new Date(Date.now() - 60*1000);
  return Mention.countDocuments({ insertedAt: { $gte: since } });
}

function severityFromRatio(ratio) {
  if (ratio >= 5) return 'critical';
  if (ratio >= 3) return 'high';
  if (ratio >= 2) return 'medium';
  return 'low';
}

function start(io) {
  // run every 5 seconds (cron string runs every 5 seconds)
  cron.schedule('*/5 * * * * *', async () => {
    try {
      const cnt = await countLastMinute();

      history.push(cnt);
      if (history.length > WINDOW) history.shift();

      const med = median(history.slice(0, -1)) || 0;
      let ratio = med > 0 ? cnt / med : (cnt > 0 ? cnt : 0);
      if (med === 0 && cnt >= 5) ratio = 10;

      // sensitivity tuned for demo: trigger if ratio >= 2 OR absolute count >= 10
      if (ratio >= 2 || cnt >= 10) {
        const top = await Mention.find({
          insertedAt: { $gte: new Date(Date.now() - 5*60*1000) }
        }).sort({ insertedAt: -1 }).limit(20);

        const sev = severityFromRatio(ratio);
        await Alert.create({
          time: new Date(),
          source: 'aggregator',
          spikeType: 'volume',
          severity: sev,
          count: cnt,
          triggeredMentions: top.map(m => m._id)
        });

        io.emit('spike', {
          count: cnt,
          median: med,
          severity: sev,
          ratio,
          top
        });

        console.log('SPIKE DETECTED:', { count: cnt, median: med, sev });
      }

      io.emit('volume', { timestamp: Date.now(), count: cnt });
    } catch (e) {
      console.error('spike detector error', e);
    }
  });
}

module.exports = { start };
