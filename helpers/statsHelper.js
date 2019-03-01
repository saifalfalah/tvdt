// will contain all methods related to email and stats endpoint
// making it generic so that our frontend can use these methods too
const mongoose = require("mongoose");
require("../models/Data");
require("../models/Download");
const Data = mongoose.model("Data");
const Download = mongoose.model("Download");
const moment = require("moment");
const helpers = require("./helpers");

// find the number of successful download requests on Date.now()

exports.masterHelper = async queryParams => {
  let stats = {};
  try {
    if (queryParams.download === "true")
      stats.downloadStats = await downloadHelper();

    if (queryParams.data === "true") stats.dataStats = await dataHelper();
  } catch (error) {
    throw error;
  }

  stats.timestamp = moment().format("lll");
  stats.todayStart = moment()
    .subtract(1, "day")
    .startOf("day")
    .format("lll");
  stats.todayEnd = moment()
    .subtract(1, "day")
    .endOf("day")
    .format("lll");
  return stats;
};

async function downloadHelper() {
  let response,
    today = {},
    downloadStats = {};
  try {
    // DAILY OR TODAY STATS
    response = await todaysRequests(Download);
    today.NOR_today = response;
    response = await getYesterdaysRequests(Download);
    today.NOR_yesterday = response;
    response = await get7DaysAverage(Download);
    today.ANOR_thisWeek = response;
    response = await get30DaysAverage(Download);
    today.ANOR_thisMonth = response;

    // WEEKLY STATS

    // MONTHLY STATS
  } catch (error) {
    throw error;
  }
  // DAILY OR TODAY STATS

  let ANOR_thisWeek_cpc = helpers.calculatePercentage(
    today.ANOR_thisWeek,
    today.NOR_today
  );
  today.ANOR_thisWeek_cpc = helpers.roundNumber(ANOR_thisWeek_cpc);

  let NOR_yesterday_cpc = helpers.calculatePercentage(
    today.NOR_yesterday,
    today.NOR_today
  );
  today.NOR_yesterday_cpc = helpers.roundNumber(NOR_yesterday_cpc);

  let ANOR_thisMonth_cpc = helpers.calculatePercentage(
    today.ANOR_thisMonth,
    today.NOR_today
  );
  today.ANOR_thisMonth_cpc = helpers.roundNumber(ANOR_thisMonth_cpc);

  downloadStats.today = today;

  // WEEKLY STATS

  return downloadStats;
}

async function dataHelper() {
  let response,
    today = {},
    dataStats = {};
  try {
    response = await todaysRequests(Data);
    today.NOR_today = response;
    response = await getYesterdaysRequests(Data);
    today.NOR_yesterday = response;
    response = await get7DaysAverage(Data);
    today.ANOR_thisWeek = response;
    response = await get30DaysAverage(Data);
    today.ANOR_thisMonth = response;
  } catch (error) {
    throw error;
  }
  let ANOR_thisWeek_cpc = helpers.calculatePercentage(
    today.ANOR_thisWeek,
    today.NOR_today
  );
  today.ANOR_thisWeek_cpc = helpers.roundNumber(ANOR_thisWeek_cpc);

  let NOR_yesterday_cpc = helpers.calculatePercentage(
    today.NOR_yesterday,
    today.NOR_today
  );
  today.NOR_yesterday_cpc = helpers.roundNumber(NOR_yesterday_cpc);

  let ANOR_thisMonth_cpc = helpers.calculatePercentage(
    today.ANOR_thisMonth,
    today.NOR_today
  );
  today.ANOR_thisMonth_cpc = helpers.roundNumber(ANOR_thisMonth_cpc);

  dataStats.today = today;
  return dataStats;
}

async function get30DaysAverage(modelName) {
  if (!modelName) modelName = Data;
  let startOfMonth = moment()
    .subtract(30, "days")
    .startOf("day")
    .toISOString();
  let endOfMonth = moment()
    .subtract(1, "day")
    .endOf("day")
    .toISOString();

  let result;

  try {
    result = await modelName.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(startOfMonth),
            $lt: new Date(endOfMonth)
          }
        }
      },
      {
        $group: {
          _id: { success: "200" },
          count: { $sum: 1 }
        }
      }
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
  result = helpers.roundNumber(result[0].count / 30);
  return result;
}

async function todaysRequests(modelName) {
  if (!modelName) modelName = Data;
  let yesterdayStartofDay = moment()
    .subtract(1, "day")
    .startOf("day")
    .toISOString();
  let yesterdayEndofDay = moment()
    .subtract(1, "day")
    .endOf("day")
    .toISOString();

  let result;

  try {
    result = await modelName.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(yesterdayStartofDay),
            $lt: new Date(yesterdayEndofDay)
          }
        }
      },
      {
        $group: {
          _id: { success: "200" },
          count: { $sum: 1 }
        }
      }
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
  return result[0].count;
}

async function get7DaysAverage(modelName) {
  if (!modelName) modelName = Data;
  let weekStartDate = moment()
    .subtract(7, "days")
    .startOf("day")
    .toISOString();
  let weekEndDate = moment()
    .subtract(1, "day")
    .endOf("day")
    .toISOString();

  let result;

  try {
    result = await modelName.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(weekStartDate),
            $lt: new Date(weekEndDate)
          }
        }
      },
      {
        $group: {
          _id: { success: "200" },
          count: { $sum: 1 }
        }
      }
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
  // console.log(result);
  result = helpers.roundNumber(result[0].count / 7);
  // result = Math.round((result[0].count / 7) * 100) / 100;
  return result;
}

async function getYesterdaysRequests(modelName) {
  if (!modelName) modelName = Data;
  let dayStart = moment()
    .subtract(2, "days")
    .startOf("day")
    .toISOString();
  let dayEnd = moment()
    .subtract(2, "days")
    .endOf("day")
    .toISOString();

  let result;
  try {
    result = await modelName.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(dayStart),
            $lt: new Date(dayEnd)
          }
        }
      },
      {
        $group: {
          _id: { success: "200" },
          count: { $sum: 1 }
        }
      }
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
  return result[0].count;
}

function getError() {
  throw `A deliberate error has occurred!`;
}
