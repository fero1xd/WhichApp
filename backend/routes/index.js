const router = require("express").Router();
const authRoutes = require("./authRoutes");
const chatRoutes = require("./chatRoutes");
const userRoutes = require("./userRoutes");

router.use("/auth", authRoutes);
router.use("/chats", chatRoutes);
router.use("/users", userRoutes);

module.exports = router;
