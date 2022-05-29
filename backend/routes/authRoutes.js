const router = require('express').Router();
const { authMiddleware, checkActivated } = require('../middlewares/auth');
const authController = require('../controllers/authController');

// @route   /auth/
// @method  GET
// @desc    Gets the logged in User
router.get('/', authMiddleware, authController.getCurrentUser);

// @route   /auth/otp
// @method  POST
// @desc    Request An OTP
router.post('/otp', authController.requestOtp);

// @route   /auth/verify
// @method  POST
// @desc    Verify An OTP
router.post('/verify', authController.verifyOtp);

// @route   /auth/
// @method  PUT
// @desc    Update a user
router.put('/', authMiddleware, authController.updateUser);

// @route   /auth/logout
// @method  GET
// @desc    Logs out user
router.get('/logout', authMiddleware, authController.logoutUser);

module.exports = router;
