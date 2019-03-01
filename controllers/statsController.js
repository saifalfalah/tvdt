const errorHandlers = require("../handlers/errorHandlers");
const statsHelpers = require("../helpers/statsHelper");

exports.get = errorHandlers.catchAsyncErrors(async (req, res, next) => {
  req.skip = true;
  req.code = "700";
  req.pathx = "/stats";
  let stats;
  try {
    stats = await statsHelpers.masterHelper(req.query);
  } catch (error) {
    req.code = "710";
    return next(error);
  }
  // Disabling logging of stats in production environment
  // console.log(stats);
  res.json(stats);
});
