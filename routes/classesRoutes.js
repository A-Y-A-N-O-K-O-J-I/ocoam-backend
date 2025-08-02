const express = require("express");
const router = express.Router()
const classes = require("../controllers/classesController")

router.get("/list-classes",classes.listClasses)
router.post("/create-classes",classes.createClass)

module.exports = router;