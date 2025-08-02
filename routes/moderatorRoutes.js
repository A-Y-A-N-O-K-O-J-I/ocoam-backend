const express = require("express");
const moderator = require("../controllers/moderatorController");
const authMiddleware = require("../middlewares/authMiddleware");


const router = express.Router();
router.get("/dashboard", moderator.dashboard);
router.get("/students", moderator.getStudentsList);
router.get("/teachers", moderator.getTeacherList);

// router.post("/reverify-email", authController.reverifyEmail);
// router.post("/login", authController.login);
// router.post("/reset-password", authController.resetPassword);
// router.post("/forgot-password", authController.forgotPassword);
// router.get("/verify", authMiddleware, authController.verifyToken);
// router.get("/verify-email", authController.verifyEmail);
// router.get("/update-password", authController.updatePasswordPage);

module.exports = router;
