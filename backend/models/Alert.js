
// models/Alert.js
const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  source: String,
  spikeType: String,
  severity: String,
  count: Number,
  triggeredMentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mention' }]
});

module.exports = mongoose.model('Alert', AlertSchema);
