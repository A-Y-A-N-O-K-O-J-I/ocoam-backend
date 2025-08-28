const express = require("express");
const moderator = require("../controllers/moderatorController");
const authMiddleware = require("../middlewares/authMiddleware");
const moderatorMiddleware = require("../middlewares/moderatorMiddleware")

const router = express.Router();
router.get("/dashboard",moderatorMiddleware, moderator.dashboard);
router.get("/students", moderatorMiddleware,moderator.getStudentsList);
router.get("/teachers", moderatorMiddleware,moderator.getTeacherList);
router.get("/profile", moderatorMiddleware,moderator.getProfileInfo);

module.exports = router;
