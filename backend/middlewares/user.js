const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');

// Will always be called after auth middlware
const canInteract = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const contacts = user.contacts;

  const { client } = req.body;

  if (
    client &&
    !contacts.find((contact) => contact.user.toString() === client)
  ) {
    return next(new AppError('You cannot interact with this user', 400));
  }

  next();
});

module.exports = { canInteract };
