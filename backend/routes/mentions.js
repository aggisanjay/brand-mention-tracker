
// routes/mentions.js
const express = require('express');
const axios = require('axios');
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

const Mention = require('../models/Mention');
const router = express.Router();

const NLP_API = process.env.NLP_API || ''; // optional external NLP endpoint

function simpleTopics(text, top_n = 3) {
  if (!text || !text.length) return [];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g,' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['about','from','there','which','their','with','your','this','that','they'].includes(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w]||0)+1;
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0, top_n).map(x=>x[0]);
}

router.post('/', async (req, res) => {
  try {
    const { source='unknown', author='anonymous', text, url, publishedAt } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ ok:false, error:'text required' });

    let sentimentResult = { score: 0, label: 'neutral' };
    let topics = simpleTopics(text);
    let embedding = [];

    // If you have an external NLP_API (python or other), try it first
    if (NLP_API) {
      try {
        const nlpRes = await axios.post(`${NLP_API}/analyze`, { text });
        if (nlpRes && nlpRes.data) {
          sentimentResult = nlpRes.data.sentiment || sentimentResult;
          topics = nlpRes.data.topics || topics;
          embedding = nlpRes.data.embedding || embedding;
        }
      } catch (e) {
        console.warn('NLP service error, falling back to JS sentiment:', e.message);
      }
    }

    // fallback JS sentiment (fast & reliable for demo)
    if (!sentimentResult || !sentimentResult.label) {
      const s = sentiment.analyze(text || '');
      // sentiment package returns score (positive/negative count)
      let label = 'neutral';
      if (s.score > 0) label = 'positive';
      else if (s.score < 0) label = 'negative';
      sentimentResult = { score: s.score, label, meta: s };
    }

    const mention = new Mention({
      source, author, text, url, publishedAt: publishedAt || new Date(), sentiment: sentimentResult, topics, embedding
    });
    await mention.save();

    const io = req.app.get('io');
    io && io.emit('new_mention', mention);

    return res.json({ ok:true, mention });
  } catch (err) {
    console.error('mention post err', err);
    return res.status(500).json({ ok:false, err: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { source, sentiment, topic, limit = 100, q } = req.query;
    const query = {};
    if (source) query.source = source;
    if (sentiment) query['sentiment.label'] = sentiment;
    if (topic) query.topics = topic;
    if (q) query.$text = { $search: q };
    const mentions = await Mention.find(query).sort({ publishedAt: -1 }).limit(parseInt(limit));
    return res.json({ ok:true, mentions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok:false, err: err.message });
  }
});

module.exports = router;
