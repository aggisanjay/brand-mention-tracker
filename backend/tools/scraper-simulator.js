const axios = require('axios');
require('dotenv').config();
const API = process.env.API || 'http://localhost:4000/api/mentions';

const messages = [
  "AcmeCorp rollout went smooth — great UX!",
  "AcmeCorp billing is terrible. Charged twice!",
  "Anyone else seeing outages on AcmeCorp dashboard?",
  "I love new features. Good job AcmeCorp.",
  "Support was helpful for me — two thumbs up.",
  "AcmeCorp made a poor decision on pricing.",
  "AcmeCorp product quality is top-notch in my opinion.",
  "Service degraded for 30 minutes, not happy with AcmeCorp."
];

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

async function sendOne() {
  const payload = {
    source: ['twitter','reddit','news','blog'][Math.floor(Math.random()*4)],
    author: 'simulator',
    text: rand(messages),
    url: 'https://example.com/post/' + Date.now(),
    publishedAt: new Date()
  };
  try {
    await axios.post(API, payload);
    console.log('sent:', payload.text);
  } catch (e) {
    console.error('send err', e.message);
  }
}

setInterval(sendOne, 1200);
sendOne();
