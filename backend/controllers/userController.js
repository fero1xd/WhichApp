const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');

exports.getAllContacts = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).populate('contacts.user');

  res.status(200).json({
    status: 'success',
    contacts: user.contacts,
  });
});

exports.addContact = catchAsync(async (req, res, next) => {
  const { countryCode, phoneNumber, saveAsName } = req.body;

  if (!countryCode || !phoneNumber) {
    return next(new AppError('Please specify the fields correctly.', 400));
  }

  const user = await User.findById(req.user.id);

  const userToAdd = await User.findOne({
    phoneNumber: { countryCode, number: phoneNumber },
    activated: true,
  });

  if (!userToAdd || userToAdd.id === user.id) {
    return next(new AppError('No User found', 400));
  }

  const alreadyThere = user.contacts.find(
    (contact) => contact.user.toString() === userToAdd.id
  );

  if (alreadyThere) {
    return next(new AppError('User already in contacts', 400));
  }

  user.contacts.unshift({
    saveAsName: saveAsName || userToAdd.name,
    user: userToAdd.id,
  });

  await user.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.removeContact = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError('Please specify the fields correctly.', 400));
  }

  const userToRemove = await User.findById(userId);
  const user = await User.findById(req.user.id);
  if (!userToRemove) {
    return next(new AppError('User not found.', 404));
  }

  const isThere = user.contacts.find(
    (contact) => contact.user.toString() === userId
  );
  if (!isThere) {
    return next(new AppError('User.', 400));
  }

  user.contacts = user.contacts.filter(
    (contact) => contact.user.toString() !== userId
  );
  await user.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.blockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError('Please specify the fields correctly.', 400));
  }

  const user = await User.findById(req.user.id);
  const target = await User.findById(userId);

  if (!target) {
    return next(new AppError('User not found.', 404));
  }

  const found = user.blockedUsers.find(
    (blocked) => blocked.user.toString() === target.id
  );

  if (found) {
    return next(new AppError('User is already blocked', 400));
  }

  user.blockedUsers.push({ user: target.id });
  await user.save();
  res.status(200).json({
    status: 'success',
  });
});
exports.unblockUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError('Please specify the fields correctly.', 400));
  }

  const user = await User.findById(req.user.id);
  const target = await User.findById(userId);

  if (!target) {
    return next(new AppError('User not found.', 404));
  }

  const found = user.blockedUsers.find(
    (blocked) => blocked.user.toString() === target.id
  );

  if (!found) {
    return next(new AppError('User is not blocked', 400));
  }

  user.blockedUsers = user.blockedUsers.filter(
    (blocked) => blocked.user.toString() != target.id
  );
  await user.save();

  res.status(200).json({
    status: 'success',
  });
});
