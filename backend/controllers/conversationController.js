const { Chat, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
  Types: {
    ObjectId: { isValid },
  },
} = require('mongoose');
const uuid = require('uuid').v4;

exports.getAllConversationsOfUser = catchAsync(async (req, res) => {
  const user = await Chat.findOne({
    user: req.user._id,
  }).populate('conversations.messagesWith');

  let result = [];

  if (user.conversations.length > 0) {
    result = user.conversations.map((convo) => {
      const found = req.user.contacts.find(
        (contact) =>
          contact.user.toString() === convo.messagesWith._id.toString()
      );

      const lastMessage =
        convo.messages.length > 0
          ? convo.messages[convo.messages.length - 1].message
            ? convo.messages[convo.messages.length - 1].message
            : 'Image'
          : '';

      return {
        messagesWith: convo.messagesWith._id,
        name: found ? found.saveAsName : convo.messagesWith.name,
        profilePicUrl: convo.messagesWith.profilePicUrl,
        lastMessage,

        date:
          convo.messages.length > 0
            ? convo.messages[convo.messages.length - 1].date
            : Date.now(),
      };
    });
  }

  res.status(200).send(result);
});

exports.deleteConversation = catchAsync(async (req, res, next) => {
  const { messagesWith } = req.params;
  if (!messagesWith) {
    return next(new AppError('Please specify the parameters correctly.', 400));
  }

  await Chat.findOneAndUpdate(
    {
      user: req.user.id,
    },
    {
      $pull: { conversations: { messagesWith } },
    }
  );

  res.status(200).json({
    status: 'success',
  });
});

exports.getMessagesOfConversation = catchAsync(async (req, res, next) => {
  const { client } = req.params;

  if (!client) {
    return next(new AppError('Please specify the parameters correctly.', 400));
  }

  const user = await Chat.findOne({ user: req.user.id }).populate(
    'conversations.messagesWith'
  );

  const convo = user.conversations.find(
    (convo) => convo.messagesWith._id.toString() === client
  );

  if (!convo) {
    const clientUser = await User.findById(client);

    if (!clientUser) {
      return next(new AppError('No user found', 404));
    }

    return res.status(200).json({
      messagesWith: clientUser,
      messages: [],
    });
  }

  res.status(200).json({
    status: 'success',
    conversation: convo,
  });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { clientId, message } = req.body;

  if (!clientId || !isValid(clientId)) {
    return next(new AppError('Please specify the fields correctly.', 400));
  }

  const newMessage = {
    _id: uuid(),
    sender: req.user.id,
    receiver: clientId,
    message,
    date: Date.now(),
  };

  await addMessage(req.user.id, clientId, newMessage);
  await addMessage(clientId, req.user.id, newMessage);

  res.status(200).json({
    status: 'success',
  });
});

const addMessage = async (userId, clientId, newMessage) => {
  const user = await Chat.findOne({ user: userId });
  const conversation = user.conversations.find(
    (convo) => convo.messagesWith.toString() === clientId
  );

  if (conversation) {
    conversation.messages.push(newMessage);
    await user.save();
  } else {
    user.conversations.unshift({
      messagesWith: clientId,
      messages: [newMessage],
    });
    await user.save();
  }
};
