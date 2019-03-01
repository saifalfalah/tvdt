const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/sizeController");

router.post("/", sizeController.post);

module.exports = router;
