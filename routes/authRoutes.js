const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");


const router = express.Router();
router.post("/signup", authController.signup);
router.get("/reverify-email", authController.reverifyEmail);
router.post("/login", authController.login);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password", authController.forgotPassword);
router.get("/verify", authMiddleware, authController.verifyToken);
router.get("/verify-email", authController.verifyEmail);
router.get("/update-password", authController.updatePasswordPage);

module.exports = router;
