const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const dataSchema = new mongoose.Schema({
  verb: {
    type: String,
    required: "REST Verb is required"
  },
  twitterURL: {
    type: Boolean,
    required: "Type of URL is required",
    default: null
  },
  url: {
    type: String,
    default: null
  },
  userIP: {
    type: String,
    required: "Access URL is required"
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  quality: String,
  success: Boolean,
  code: String
});

module.exports = mongoose.model("Data", dataSchema);
