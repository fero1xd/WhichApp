const jwt = require('jsonwebtoken');

const setNewToken = async (user, res) => {
  user.jwt = undefined;
  user.jwtExpires = undefined;

  const payload = {
    userId: user._id,
  };

  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '2d' },
    async (err, token) => {
      if (err) throw err;
      user.jwt = token;
      const date = new Date();
      user.jwtExpires = date.setDate(date.getDate() + 2);

      await user.save();

      res.cookie('token', token, {
        maxAge: 172800000, // 2 days
        httpOnly: true,
      });

      res.status(200).json({
        status: 'success',
        message: 'Welcome Aboard',
        auth: user.activated,
      });
    }
  );
};

module.exports = { setNewToken };
