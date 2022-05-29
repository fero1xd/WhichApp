const twillio = require('twilio');
const otpGenerator = require('otp-generator');

require('dotenv').config();

const client = new twillio(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);

exports.generateOtp = () => {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

exports.sendOtp = async (num, otp) => {
  await client.messages.create({
    body: 'This is your OTP for WhichApp - ' + otp,
    to: num,
    from: process.env.TWILLIO_TRIAL_NO,
  });
};
