const axios = require("axios");
const errorHandlers = require("../handlers/errorHandlers");
const helpers = require("../helpers/helpers");

exports.post = errorHandlers.catchAsyncErrors(async (req, res, next) => {
  // skipping the next catch-all route
  req.skip = true;

  // adding the path to the req object for morgan logging
  req.pathx = "/download";

  // checking if the request sent contains url or not
  if (!req.body.url) return next("600");

  // getting the url from the request body
  const url = req.body.url;

  // for db logging
  req.urlx = url;

  // checking if the url in the request body is indeed a url or something else
  if (!helpers.isUrl(url)) return next("601");

  // checking if the url in the request body is a twitter url or not
  if (!helpers.isTwitterUrl(url)) return next("602");

  // hard url for testing
  // const url = "https://twitter.com/summer95/status/1050225668187987970";

  // getting the unique tweet path that identifies the tweet
  let tweetPath = helpers.getTweetPath(url);

  // constructing the request url
  let requestURL = helpers.requestURL(tweetPath);

  // the contents of the request will be stored here
  let data;

  // getting the data
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
  // data contains a lot of information. The data we require is
  // conincidently stored within the data object.
  data = data.data;

  // checks if the tweet actually contains video information or not
  if (!helpers.containsVideo(data)) {
    req.code = "404";
    return next("604");
  }

  // bitrates is an array containing the sorted bitrates of
  // all the video variants
  let bitrates = helpers.getBitrate(data);

  // the next function, prepares the download object by matching
  // the download url with bitrates acquired in the line above
  // and also calculating the size of all the videos.
  // finally it prepares the downloadObject and sends it back
  let downloadObject = helpers.makeDownloadObject(data, bitrates);

  // add NA to downloadObject when size or medium is not present
  downloadObject = helpers.sanitize(downloadObject);

  // for db logging
  req.code = "200";

  // sending the object to the client
  res.json(downloadObject);
  next();
});

// exports.test = (req, res, next) => {
//   req.code = "900";
//   console.log(req.body.url);

//   const finalData = {
//     high: {
//       size: "NA",
//       downloadURL:
//         "https://video.twimg.com/ext_tw_video/1050225629256278016/pu/vid/720x1280/V-g_RcEfrouW4HjN.mp4?tag=5"
//     },
//     medium: {
//       size: "NA",
//       downloadURL:
//         "https://video.twimg.com/ext_tw_video/1050225629256278016/pu/vid/720x1280/V-g_RcEfrouW4HjN.mp4?tag=5"
//     },
//     low: {
//       size: "1 MB",
//       downloadURL:
//         "https://video.twimg.com/ext_tw_video/1050225629256278016/pu/vid/720x1280/V-g_RcEfrouW4HjN.mp4?tag=5"
//     }
//   };

//   res.json(finalData);
// };
