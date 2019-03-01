const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");

router.get("/", statsController.get);

module.exports = router;
