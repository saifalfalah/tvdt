const axios = require("axios");
const errorHandlers = require("../handlers/errorHandlers");
const helpers = require("../helpers/helpers");

exports.get = (req, res, next) => {
  next();
};

exports.post = errorHandlers.catchAsyncErrors(async (req, res, next) => {
  // skipping the next route in router.js
  req.skip = true;
  req.pathx = "/resolve";

  // setting it to false so that if we get into any problems we don't have to set
  // it again. On success, we set it once when we send the video url to the client.
  req.success = false;

  if (!req.body.url) return next("600");
  const url = req.body.url;
  let quality;
  if (req.body.quality) {
    quality = req.body.quality;
    // adding on req object for logging
    req.quality = quality;
  } else {
    quality = "medium";
    // adding on req object for logging
    req.quality = null;
  }

  if (!helpers.isUrl(url)) {
    // adding on req object for logging
    req.urlx = url;
    // summoning the error handler
    return next("601");
  } else req.urlx = url; // adding on req object for logging

  if (!helpers.isTwitterUrl(url)) {
    req.twitterURL = false;
    // summoning the error handler
    return next("602");
  } else req.twitterURL = true;

  let tweetPath = helpers.getTweetPath(url);

  let requestURL = helpers.requestURL(tweetPath);

  let data;

  try {
    data = await axios({
      method: "get",
      url: requestURL,
      headers: {
        authorization: process.env.TOKEN
      }
    });
  } catch (error) {
    // summoning the error handler
    return next("603");
  }

  // setting the data variable to the data field of the object returned and
  // stored in the data variable itself.
  data = data.data;

  let videoURL = helpers.getVideoUrl(data, quality);
  if (videoURL) {
    res.send(videoURL);
    req.success = true;
    req.code = "200";
  } else {
    // adding on req object for logging
    // update: seems it is not needed (next 2 lines). Remove it if possible.
    req.success = false;
    req.code = "404";
    // summoning the error handler
    return next("604");
  }
  next();
});
