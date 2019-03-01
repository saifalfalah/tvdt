const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const sizeSchema = new mongoose.Schema({
  verb: {
    type: String,
    require: "REST Verb is required"
  },
  url: {
    type: String,
    default: null
  },
  twitterURL: {
    type: Boolean,
    require: "Type of URL is required"
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  code: String,
  success: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Size", sizeSchema);
