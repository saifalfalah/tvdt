const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const downloadSchema = new mongoose.Schema({
  verb: {
    type: String,
    require: "REST Verb is required"
  },
  url: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  statusCode: {
    type: String,
    require: "Status Code is required"
  }
});

module.exports = mongoose.model("Download", downloadSchema);
