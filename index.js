const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const mongoose = require("mongoose");
let databaseLogger = require("./logger");

let router = require("./routes/router");
let resolveRouter = require("./routes/resolveRouter");
let errorHandlers = require("./handlers/errorHandlers");
const sizeRouter = require("./routes/sizeRouter");
const downloadRouter = require("./routes/downloadRouter");
const emailRouter = require("./routes/emailRouter");
const statsRouter = require("./routes/statsRouter");
// console.log(process.env.NODE_ENV);
// console.log(app.get("env"));

app.use(cors());

app.use(helmet());

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

morgan.token("url", function getURL(req) {
  if (req.body.url) return req.body.url;
  else return "NA";
});

morgan.token("quality", function getQuality(req) {
  if (req.pathx === "/resolve" && req.method === "POST") {
    if (req.body.quality) return req.body.quality;
    else return "medium*";
  } else {
    return "NA";
  }
});

morgan.token("code", function getCode(req) {
  return req.code.slice(0, 3);
});

morgan.token("path", function getPath(req) {
  if (req.pathx) return req.pathx;
  else return req.path;
});

// morgan.token("writeStatus", function getWriteStatus(req) {
//   return req.writeStatus;
// });

app.use(
  morgan(":method, :path, :response-time ms, :url, :quality quality, :code")
);

// let corsOptions = {
//   origin: 'localhost:3001'
// }

mongoose.connect(
  process.env.DB,
  { useNewUrlParser: true }
);
mongoose.Promise = global.Promise;
mongoose.connection.on("error", err => {
  console.log(`DB ERROR: ${err.message}`);
});

// importing our model
require("./models/Data");

// route handlers
app.use("/download", downloadRouter);
app.use("/resolve", resolveRouter);
app.use("/email", emailRouter);
app.use("/stats", statsRouter);
app.use("/size", sizeRouter);
app.all("*", router);

// error handlers
app.use(errorHandlers.productionErrors);

// information logger
app.use(databaseLogger.logger);

app.listen(port, () => console.log(`TVD listening on port ${port}`));
