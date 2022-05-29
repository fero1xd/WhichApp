const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    },
    receiver: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Message = mongoose.model('messages', messageSchema);
