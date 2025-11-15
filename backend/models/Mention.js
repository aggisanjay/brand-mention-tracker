

// models/Mention.js
const mongoose = require('mongoose');

const MentionSchema = new mongoose.Schema({
  source: { type: String, default: 'unknown' },
  author: { type: String, default: 'anonymous' },
  text: { type: String, required: true },
  url: String,
  publishedAt: { type: Date, default: Date.now },
  sentiment: {
    score: { type: Number, default: 0 },
    label: { type: String, enum: ['positive','neutral','negative'], default: 'neutral' }
  },
  topics: [String],
  embedding: { type: [Number], default: [] },
  insertedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Mention', MentionSchema);
