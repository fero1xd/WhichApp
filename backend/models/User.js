const { default: mongoose } = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phoneNumber: {
      countryCode: {
        type: String,
        required: true,
      },
      number: {
        type: String,
        required: true,
        min: 5,
        unique: true,
      },
    },
    status: {
      type: String,
    },
    contacts: [
      {
        saveAsName: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
    blockedUsers: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
    profilePicUrl: String,
    jwt: {
      type: String,
      select: false,
    },
    jwtExpires: {
      type: Date,
      select: false,
    },
    activated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = User = mongoose.model('users', userSchema);
