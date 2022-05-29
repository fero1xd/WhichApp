const { Chat, User } = require('../models/index');
const uuid = require('uuid').v4;

const loadMessages = async (userId, messagesWith) => {
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(messagesWith);
    if (!user || !friend) {
      return { error: 'Error loading messages' };
    }

    // Check if its in the users contact
    const isFound = user.contacts.find(
      (contact) => contact.user.toString() === messagesWith
    );

    const chatModel = await Chat.findOne({ user: userId });
    const conversationFound = chatModel.conversations.find(
      (convo) => convo.messagesWith.toString() === messagesWith
    );

    // Means user himself blocked the user
    const selfBlocked = Boolean(
      user.blockedUsers.find((blocked) => blocked.user.toString() === friend.id)
    );

    // Means the other user blocked this user
    const isBlocked = Boolean(
      friend.blockedUsers.find((blocked) => blocked.user.toString() === user.id)
    );

    if (!conversationFound) {
      if (!isFound) {
        return { error: true };
      }
      return {
        name: isFound ? isFound.saveAsName : friend.name,
        profilePicUrl: friend.profilePicUrl,
        messages: [],
        messagesWith: friend.id,
        inContacts: isFound ? true : false,
        phoneNumber: friend.phoneNumber,
        selfBlocked,
        isBlocked,
      };
    }

    return {
      name: isFound ? isFound.saveAsName : friend.name,
      profilePicUrl: friend.profilePicUrl,
      messages: conversationFound.messages,
      messagesWith: friend.id,
      inContacts: isFound ? true : false,
      phoneNumber: friend.phoneNumber,
      selfBlocked,
      isBlocked,
    };
  } catch (e) {
    console.log(e);
    return { error: 'Error loading messages' };
  }
};

const sendMessage = async (userId, messagesWith, messageBody) => {
  try {
    const user = await Chat.findOne({ user: userId });

    // receiver
    const messageSendToUser = await Chat.findOne({ user: messagesWith });

    const newMessage = {
      _id: uuid(),
      sender: userId,
      receiver: messagesWith,
      message: messageBody.message || undefined,
      image: messageBody.image || undefined,
      date: Date.now(),
    };

    const conversationFound = findConversation(user, messagesWith);

    if (!conversationFound) {
      user.conversations.unshift({ messagesWith, messages: [newMessage] });
    } else {
      conversationFound.messages.push(newMessage);
    }

    const secondConvoFound = findConversation(messageSendToUser, userId);

    if (!secondConvoFound) {
      messageSendToUser.conversations.push({
        messagesWith: userId,
        messages: [newMessage],
      });
    } else {
      secondConvoFound.messages.push(newMessage);
    }

    await messageSendToUser.save();
    await user.save();

    const sender = await User.findById(userId).populate('contacts.user');
    const receiver = await User.findById(messagesWith).populate(
      'contacts.user'
    );

    const found = sender.contacts.find(
      (contact) => contact.user._id.toString() === messagesWith
    );

    const foundOnReceiver = receiver.contacts.find(
      (contact) => contact.user._id.toString() === sender.id
    );

    return {
      newMessage,
      name: found ? found.saveAsName : receiver.name,
      profilePicUrl: receiver.profilePicUrl,
      senderName: foundOnReceiver ? foundOnReceiver.saveAsName : sender.name,
      senderProfilePic: sender.profilePicUrl,
    };
  } catch (e) {
    console.log(e);
    return { error: true };
  }
};

const findConversation = (model, userId) => {
  return model.conversations.find(
    (convo) => convo.messagesWith.toString() === userId
  );
};

module.exports = { loadMessages, sendMessage };
