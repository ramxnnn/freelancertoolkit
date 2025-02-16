const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  placeId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  rating: { type: Number },
  savedAt: { type: Date, default: Date.now },
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;