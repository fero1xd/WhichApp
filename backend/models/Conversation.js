const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  recipients: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    },
  ],
  lastMessage: String,
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'messages',
    },
  ],
  date: {
    type: String,
    default: Date.now,
  },
});

module.exports = Conversation = mongoose.model(
  'conversations',
  conversationSchema
);
