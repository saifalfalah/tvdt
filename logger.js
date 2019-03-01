const mongoose = require("mongoose");
require("./models/Data");
require("./models/Size");
require("./models/Download");
const Data = mongoose.model("Data");
const Size = mongoose.model("Size");
const Download = mongoose.model("Download");

exports.logger = async (req, res) => {
  // console.log(`Hello from logger`);
  if (req.pathx === "/resolve") {
    if (!req.twitterURL) req.twitterURL = false;
    const data = new Data({
      verb: req.method,
      twitterURL: req.twitterURL,
      url: req.urlx,
      userIP: req.ip,
      timestamp: Date.now(),
      quality: req.quality,
      success: req.success,
      code: req.code
    });
    await data.save();
  } else if (req.pathx === "/download") {
    const download = new Download({
      verb: req.method,
      url: req.urlx,
      timestamp: Date.now(),
      statusCode: req.code
    });
    await download.save();
  } else if (req.pathx === "/size") {
    if (!req.twitterURL) req.twitterURL = false;
    const size = new Size({
      verb: req.method,
      url: req.urlx,
      twitterURL: req.twitterURL,
      timestamp: Date.now(),
      code: req.code,
      success: req.success
    });
    await size.save();
  }

  // req.writeStatus = "700";
};
