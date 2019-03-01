const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

router.get("/", emailController.get);

module.exports = router;
