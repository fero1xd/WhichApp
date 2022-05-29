const router = require('express').Router();
const conversationController = require('../controllers/conversationController');
const { authMiddleware, checkActivated } = require('../middlewares/auth');
const { canInteract } = require('../middlewares/user');

router.use(authMiddleware, checkActivated);

// @route   /room/
// @method  GET
// @desc    Gets all conversation of an user
router.get('/', conversationController.getAllConversationsOfUser);

// @route   /room/:roomId
// @method  GET
// @desc    Gets a single conversation
router.get('/:client', conversationController.getMessagesOfConversation);

// @route   /room/message
// @method  POST
// @desc    Add message to a conversation
router.post('/message', conversationController.sendMessage);

// @route   /room/message
// @method  POST
// @desc    Add message to a conversation
router.delete('/:messagesWith', conversationController.deleteConversation);
module.exports = router;
