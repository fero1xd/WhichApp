let users = [];

const findCall = (sid, io) => {
  const connected = users.find((user) => user.socketId === sid);
  if (connected && connected.call) {
    const client = findConnectedUser(connected.call);
    if (client) {
      io.to(client.socketId).emit('callerDisconnected');
      EditData(connected.call, null);
    }
  }
};

const addUser = (userId, socketId) => {
  const user = users.find((user) => user.userId === userId);

  if (user && user.socketId === socketId) {
    return users;
  }
  //
  else {
    if (user && user.socketId !== socketId) {
      removeUser(user.socketId);
    }

    const newUser = { userId, socketId };

    users.push(newUser);

    return users;
  }
};

const EditData = (id, call) => {
  users = users.map((item) => (item.userId === id ? { ...item, call } : item));
  console.log(users);
};

const removeUser = (socketId) => {
  const indexOf = users.map((user) => user.socketId).indexOf(socketId);

  users.splice(indexOf, 1);

  return users;
};

const findConnectedUser = (userId) =>
  users.find((user) => user.userId === userId);

const getAllUsers = () => {
  return users;
};

module.exports = {
  addUser,
  removeUser,
  findConnectedUser,
  getAllUsers,
  users,
  EditData,
  findCall,
};
