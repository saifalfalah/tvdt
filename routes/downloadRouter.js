const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/downloadController");

router.post("/", downloadController.post);

module.exports = router;
