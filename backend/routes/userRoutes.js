const router = require('express').Router();
const userController = require('../controllers/userController');
const { authMiddleware, checkActivated } = require('../middlewares/auth');

router.use(authMiddleware, checkActivated);

// @route   /users/
// @method  GET
// @desc    Gets all contacts
router.get('/', userController.getAllContacts);

// @route   /users/add
// @method  PUT
// @desc    Add an user to contacts list
router.post('/add', userController.addContact);

// @route   /users/block/:userId
// @method  POST
// @desc    Blocks an user
router.post('/block/:userId', userController.blockUser);

// @route   /users/block/:userId
// @method  POST
// @desc    Unblocks an user
router.post('/unblock/:userId', userController.unblockUser);

// @route   /users/:userId
// @method  DELETE
// @desc    Removes an user from contact
router.delete('/:userId', userController.removeContact);

module.exports = router;
