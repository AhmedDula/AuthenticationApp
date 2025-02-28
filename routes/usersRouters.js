const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController")
const verify =require("../middleware/verify")


router.use(verify)
router.route("/").get(usersController.getAllUsers)

module.exports = router;