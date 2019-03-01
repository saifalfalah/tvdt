const express = require("express");
const router = express.Router();
const resolveController = require("../controllers/resolveController");

router.get("/", resolveController.get);

router.post("/", resolveController.post);

module.exports = router;
