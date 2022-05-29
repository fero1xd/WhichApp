const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    conversations: [
      {
        messagesWith: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users',
          required: true,
        },
        messages: [
          {
            _id: String,
            message: {
              type: String,
            },
            image: String,
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            date: { type: Date },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = Chat = mongoose.model('chats', chatSchema);
