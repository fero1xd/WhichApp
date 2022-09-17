const users = {};

const findCall = (socketId, io) => {
  const connected = users[socketId];

  if (connected && connected.call) {
    const client = findConnectedUser(connected.call);
    if (client) {
      io.to(client.socketId).emit('callerDisconnected');
      addPropertyToUser(connected.call, null);
    }
  }
};

const addUser = (userId, socketId) => {
  const newUser = { userId, socketId };

  users[socketId] = newUser;

  return users;
};

const addPropertyToUser = (id, item) => {
  const user = findConnectedUser(id) || findConnectedUserBySocketId(id);

  if (user) {
    users[user.socketId] = { ...user, call: item };
  }

  console.log(users);
};

const removeUser = (socketId) => {
  delete users[socketId];
  return users;
};

const findConnectedUser = (userId) =>
  Object.values(users).find((u) => u.userId === userId);

const findConnectedUserBySocketId = (socketId) => users[socketId];

const getAllUsers = () => users;

module.exports = {
  addUser,
  removeUser,
  findConnectedUser,
  findConnectedUserBySocketId,
  getAllUsers,
  users,
  addPropertyToUser,
  findCall,
};
