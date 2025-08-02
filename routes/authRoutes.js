const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const moderatorMiddleware = require("../middlewares/moderatorMiddleware");


const router = express.Router();
router.post("/signup", authController.signup);
router.post("/reverify-email", authController.reverifyEmail);
router.post("/login", authController.login);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-token", authMiddleware, authController.verifyToken);
router.post("/become-moderator", authMiddleware, authController.becomeModerator);
router.post("/verify-moderator-token", authMiddleware, authController.verifyModeratorToken);
router.post("/verify-email", authController.verifyEmail);
router.get("/logout", authController.logout);

module.exports = router;
