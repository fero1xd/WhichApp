const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const hashService = require('../utils/hashService');
const { User, Chat } = require('../models');
const { generateOtp, sendOtp } = require('../utils/twillioService');
const { setNewToken } = require('../utils/authUtils');
const Uploader = require('./uploads/Uploader');
require('dotenv').config();
const uuid = require('uuid').v4;

exports.getCurrentUser = catchAsync(async (req, res) => {
  return res.status(200).json(req.user);
});

exports.requestOtp = catchAsync(async (req, res, next) => {
  const { countryCode, number } = req.body;

  if (!number || !countryCode) {
    return next(new AppError('Please specify the fields correctly', 400));
  }

  const otp = generateOtp();

  const ttl = 1000 * 60 * 2; // 2 min
  // const ttl = 20000;
  const expires = Date.now() + ttl;
  const data = `${countryCode + number}.${otp}.${expires}`;
  const hash = hashService.hashOtp(data);

  // await sendOtp(countryCode + phoneNumber, otp);

  return res.status(200).json({
    status: 'success',
    hash: `${hash}.${expires}`,
    // temp,
    otp,
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { otp, hash, countryCode, number } = req.body;

  if (!otp || !hash || !number || !countryCode) {
    return next(new AppError('Please specify the fields correctly', 400));
  }

  const [hashedOtp, expires] = hash.split('.');
  if (Date.now() > +expires) {
    return next(new AppError('OTP Expired', 400));
  }

  const data = `${countryCode + number}.${otp}.${expires}`;

  let computedHash = hashService.hashOtp(data);
  if (computedHash != hashedOtp) {
    return next(new AppError('Invalid OTP', 400));
  }

  let user = await User.findOne({
    phoneNumber: {
      countryCode,
      number,
    },
  });

  if (!user) {
    user = new User({
      phoneNumber: {
        countryCode,
        number,
      },
    });
  }

  await setNewToken(user, res);
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { file } = req;
  const { name, status } = req.body;

  if (!name && !file) {
    return next(new AppError('Please specify the fields correctly', 400));
  }

  const user = await User.findById(req.user.id);
  user.name = name || user.name;

  if (file) {
    const { Location } = await Uploader.upload(file, uuid());
    user.profilePicUrl =
      Location || user.profilePicUrl || process.env.DEFAULT_PROFILE_PIC;
  }

  user.status = status || 'I am having a great day!';

  if (!user.activated) {
    user.activated = true;
    user.contacts = [];

    await Chat.create({
      user: user.id,
      chats: [],
    });
  }

  await user.save();

  return res.status(200).json({
    status: 'success',
    message: 'Information Updated successfully',
  });
});

exports.logoutUser = catchAsync(async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    status: 'success',
  });
});
