const isURL = require("is-url");
const parse = require("url-parse");

exports.isUrl = url => isURL(url);

exports.isTwitterUrl = url => {
  const parsedURL = parse(url);
  if (
    parsedURL.hostname !== "twitter.com" &&
    parsedURL.hostname !== "www.twitter.com" &&
    parsedURL.hostname !== "mobile.twitter.com"
  )
    return false;
  else return true;
};

exports.getTweetPath = url => parse(url).pathname.split("/")[3];

exports.getVideoUrl = (data, quality) => {
  if (
    data.hasOwnProperty("extended_entities") &&
    data.extended_entities.media[0].video_info
  ) {
    let videoSizes = calculateSize(
      data.extended_entities.media[0].video_info.variants
    );

    let videoURL;

    if (quality === "low") {
      videoURL = videoSizes[0];
    } else if (quality === "medium") {
      if (videoSizes.length > 1) videoURL = videoSizes[1];
      else videoURL = videoSizes[0];
    } else if (quality === "high") {
      if (videoSizes.length > 2) videoURL = videoSizes[videoSizes.length - 1];
      else if (videoSizes.length > 1) videoURL = videoSizes[1];
      else videoURL = videoSizes[0];
    }
    return videoURL.url;
  } else {
    return false;
  }
};

exports.getSize = data => {
  if (
    !data.hasOwnProperty("extended_entities") ||
    !data.extended_entities.media[0].video_info
  ) {
    return false;
  }
  // if it is a GIF, we don't actually do all the fancy calculations.
  // we just send the array that contains the GIF data.
  if (data.extended_entities.media[0].video_info.variants[0].bitrate === 0) {
    return data.extended_entities.media[0].video_info.variants;
  }
  let duration = data.extended_entities.media[0].video_info.duration_millis;
  duration = duration / 1000;
  let videos = data.extended_entities.media[0].video_info.variants;
  videos = videos.filter(el => el.content_type === "video/mp4");
  videos = videos.map(el => (el.bitrate * duration) / 8 / 1024 / 1024);
  videos = videos.map(el => Math.round(el * 100) / 100);
  videos.sort((a, b) => a - b);
  return videos;
};

calculateSizeBitrate = function(bitrate, duration) {
  let size = (bitrate * duration) / 8 / 1024 / 1024;
  size = Math.round(size * 100) / 100;
  size = size.toString() + " MB";
  return size;
};

exports.makeDownloadObject = (data, bitrates) => {
  // final object that gets sent
  let downloadObject = {};
  // for a lack of better way, I create three objects that will be
  // appended to the downloadObject and sent back
  let high = {},
    medium = {},
    low = {};
  // trimming down the data we are working with
  let variants = data.extended_entities.media[0].video_info.variants;
  // saving the duration for size calculation
  let duration = data.extended_entities.media[0].video_info.duration_millis;
  // ms to second
  duration /= 1000;
  // removing anything other than mp4
  variants = variants.filter(el => el.content_type === "video/mp4");
  // main logic starts here
  // we match the bitrate with the variant array.
  // on match, we store the video url in videoUrl variable
  // and we also calculate the size in MB which is where our
  // duration variable defined earlier comes in handy.
  // We pop the array after every calculation so that we can focus on
  // other sizes on the next iteration of the loop.
  while (bitrates.length > 0) {
    if (bitrates.length === 3) {
      let videoUrl;
      variants.forEach(variant => {
        if (variant.bitrate === bitrates[2]) videoUrl = variant.url;
      });
      high.downloadURL = videoUrl;
      let size = calculateSizeBitrate(bitrates[2], duration);
      high.size = size;
      downloadObject.high = high;
      bitrates.pop();
    } else if (bitrates.length === 2) {
      let videoUrl;
      variants.forEach(variant => {
        if (variant.bitrate === bitrates[1]) videoUrl = variant.url;
      });
      medium.downloadURL = videoUrl;
      let size = calculateSizeBitrate(bitrates[1], duration);
      medium.size = size;
      downloadObject.medium = medium;
      bitrates.pop();
    } else if (bitrates.length === 1) {
      let videoUrl;
      variants.forEach(variant => {
        if (variant.bitrate === bitrates[0]) videoUrl = variant.url;
      });
      low.downloadURL = videoUrl;
      let size = calculateSizeBitrate(bitrates[0], duration);
      low.size = size;
      downloadObject.low = low;
      bitrates.pop();
    }
  }
  return downloadObject;
};

exports.sanitize = o => {
  // note: not sure if sanitize is the right word
  // this method adds structure to the downloadObject as required by our client
  // app. If medium or high quality is not present, it adds those objects to the
  // object with the size property set to NA. This helps the client side to parse
  // the length of the size object and skip showing the length etc as appropriate.
  if (!o.hasOwnProperty("medium")) {
    // define medium
    let medium = {};
    // set size as "NA"
    medium.size = "NA";
    // add same download url as low
    medium.downloadURL = o.low.downloadURL;
    // append it to the object
    o.medium = medium;
  }
  if (!o.hasOwnProperty("high")) {
    // define high
    let high = {};
    // set size as "NA"
    high.size = "NA";
    // add same download url as medium
    high.downloadURL = o.medium.downloadURL;
    // append it to the object
    o.high = high;
  }
  return o;
};

exports.makeObject = sizeArray => {
  let videos = {};
  // checking if the video being downloaded is gif or not. if it's gif
  // we just send 0 MB as video size as GIF's actual size is not available through
  // twitter api.
  if (sizeArray.length == 1 && sizeArray[0].bitrate == 0) {
    videos.low = "GIF";
    return videos;
  }
  while (sizeArray.length > 0) {
    if (sizeArray.length == 3) {
      videos.high = sizeArray[2] + " MB";
      sizeArray.pop();
    }
    if (sizeArray.length == 2) {
      videos.medium = sizeArray[1] + " MB";
      sizeArray.pop();
    }
    if (sizeArray.length == 1) {
      if (!videos.high) videos.high = "NA";
      if (!videos.medium) videos.medium = "NA";
      videos.low = sizeArray[0] + " MB";
      sizeArray.pop();
    }
  }
  return videos;
};

exports.containsVideo = data => {
  if (
    !data.hasOwnProperty("extended_entities") ||
    !data.extended_entities.media[0].video_info
  )
    return false;
  else return true;
};

exports.getBitrate = data => {
  let variants = data.extended_entities.media[0].video_info.variants;
  variants = variants.filter(el => el.content_type === "video/mp4");
  variants = variants.map(el => el.bitrate);
  variants.sort((a, b) => a - b);
  return variants;
};

exports.requestURL = tweetPath =>
  `https://api.twitter.com/1.1/statuses/show.json?id=${tweetPath}&tweet_mode=extended`;

const calculateSize = function(vids) {
  // filtering only for mp4 videos OR filtering out m3u8 links
  vids = vids.filter(el => el.content_type === "video/mp4");
  vids.sort((a, b) => {
    return a.bitrate - b.bitrate;
  });
  return vids;
};

exports.roundNumber = number => Math.round(number * 100) / 100;

exports.calculatePercentage = (oldN, newN) => ((newN - oldN) / oldN) * 100;
