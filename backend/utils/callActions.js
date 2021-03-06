const { User } = require('../models');

const getMutualInfo = async (userId, userToCallId, peerId) => {
  try {
    const user = await User.findById(userId);
    const userToCall = await User.findById(userToCallId);

    if (!user || !userToCall) {
      return { error: true };
    }

    const foundSelf = userToCall.contacts.find(
      (contact) => contact.user.toString() === user.id
    );

    const found = user.contacts.find(
      (contact) => contact.user.toString() === userToCall.id
    );

    const selfBlocked = Boolean(
      user.blockedUsers.find(
        (blocked) => blocked.user.toString() === userToCall.id
      )
    );
    const isBlocked = Boolean(
      userToCall.blockedUsers.find(
        (blocked) => blocked.user.toString() === user.id
      )
    );

    if (selfBlocked || isBlocked) {
      if (selfBlocked) return { selfBlocked };
      if (isBlocked) return { isBlocked };
    }
    return {
      sender: userId,
      recipient: userToCall.id,
      profilePicUrl: user.profilePicUrl,
      recipientProfilePicUrl: userToCall.profilePicUrl,
      recipientName: found ? found.saveAsName : userToCall.name,
      name: foundSelf ? foundSelf.saveAsName : user.name,
      peerId,
    };
  } catch {
    return { error: true };
  }
};

module.exports = { getMutualInfo };
