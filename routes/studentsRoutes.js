const express = require("express");
const students = require("../controllers/studentController");
const authMiddleware = require("../middlewares/authMiddleware");
const applicationController = require("../controllers/applicationController");
const { uploadApplicationDocuments } = require("../middlewares/multerConfig");


const router = express.Router();
router.get("/dashboard", authMiddleware, students.dashboard);
router.post(
  "/apply",
  authMiddleware,
  uploadApplicationDocuments,
  applicationController.submitApplication
);
router.get("/application-status",authMiddleware, applicationController.checkApplicationStatus);

// router.get("/students", moderator.getStudentsList);
// router.get("/teachers", moderator.getTeacherList);

// router.post("/reverify-email", authController.reverifyEmail);
// router.post("/login", authController.login);
// router.post("/reset-password", authController.resetPassword);
// router.post("/forgot-password", authController.forgotPassword);
// router.get("/verify", authMiddleware, authController.verifyToken);
// router.get("/verify-email", authController.verifyEmail);
// router.get("/update-password", authController.updatePasswordPage);

module.exports = router;
