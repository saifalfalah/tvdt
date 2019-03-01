const axios = require("axios");
const errorHandlers = require("../handlers/errorHandlers");
const helpers = require("../helpers/helpers");

exports.post = errorHandlers.catchAsyncErrors(async (req, res, next) => {
  // skipping the next catch-all route
  req.skip = true;
  // adding path to the req object for morgan logging
  req.pathx = "/size";
  req.success = false;
  if (!req.body.url) return next("600");
  const url = req.body.url;
  req.urlx = url;
  if (!helpers.isUrl(url)) return next("601");
  if (!helpers.isTwitterUrl(url)) return next("602");
  req.twitterURL = true;

  let tweetPath = helpers.getTweetPath(url);
  const requestURL = helpers.requestURL(tweetPath);
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
    return next("603");
  }
  let sizes = helpers.getSize(data.data);
  if (!sizes) {
    req.code = "404";
    return next("604");
  }
  let sizeObject = helpers.makeObject(sizes);
  res.json(sizeObject);
  req.success = true;
  req.code = "200";
  next();
  // res.send(data.data);
});
