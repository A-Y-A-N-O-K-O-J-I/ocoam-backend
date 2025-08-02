const express = require("express");
const router = express.Router()
const classes = require("../controllers/classesController")
const moderatorMiddleware = require("../middlewares/moderatorMiddleware")

router.get("/list-classes",classes.listClasses)
router.delete("/delete-class/:id",moderatorMiddleware,classes.deleteClass)
router.post("/create-classes",moderatorMiddleware,classes.createClass)

module.exports = router;