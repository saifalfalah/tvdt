exports.catchAsyncErrors = fn => {
  // console.log("Hello from catchAsyncErrors");
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

exports.productionErrors = (err, req, res, next) => {
  // console.log(`Hello from error handler`);
  switch (err) {
    case "600":
      req.code = "600: no url found";
      res.status(400).send({ error: "no url found" });
      break;
    case "601":
      req.code = "601: not a url";
      res.status(400).send({ error: "not a url" });
      break;
    case "602":
      req.code = "602: not a twitter url";
      res.status(400).send({ error: "not a twitter url" });
      break;
    case "603":
      req.code = "603: error fetching tweet";
      res.status(424).send({ error: "error fetching tweet" });
      break;
    case "604":
      req.code = "604: video not found";
      res.status(404).send({ error: "video not found" });
      break;
    case "620":
      req.code = "620: request to an unsupported route";
      res.redirect("https://tvdl.saif.dev/?ref=nowEndpoint");
      // res.send(
      //   "Welcome to Twitter Video Downloader for Siri. Made by Saif Al Falah (u/freelancedev_, @saifalfalah)."
      // );
      break;
    default:
      console.log(`CRITICAL ERROR OCCURRED: ${err}`);
      req.code = "605: something blew up";
      res.status(500).send({ error: "something blew up" });
      break;
  }
  next();
};
