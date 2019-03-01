const errorHandlers = require("../handlers/errorHandlers");
const helpers = require("../helpers/helpers");
const statsHelpers = require("../helpers/statsHelper");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.get = errorHandlers.catchAsyncErrors(async (req, res, next) => {
  req.skip = true;
  req.code = "700";
  let stats;
  try {
    stats = await statsHelpers.masterHelper(req.query);
  } catch (error) {
    req.code = "710";
    return next(error);
  }
  // Disabling logging of stats in production environment
  // console.log(stats);

  let text = constructText(stats);

  let emailMsg = {
    to: "saifalfalah@protonmail.com",
    from: "hi@saif.io",
    subject: "Twitter Video Downloader Daily Stats",
    text: `${text}`
  };
  try {
    await sgMail.send(emailMsg);
    console.log("Email sent.");
    res.send("Email Sent!");
  } catch (error) {
    req.code = "710";
    return next(error);
  }
});

function constructText(stats) {
  let text = `🙌 Welcome to 📅 Daily 🐦 TVD Stats 📃 (Version 2.1).\n\nHere are your stats: 🔥\n\n`;

  if (stats.dataStats) {
    text += `〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰\n\n`;

    text += `⏰ The time is: ${new Date().toISOString()}\n\n`;
    text += `💻 Server timestamp: ${stats.timestamp}\n\n`;
    text += `🥗 Serving stats from: 🕛 ${stats.todayStart} to 🕛 ${
      stats.todayEnd
    }\n\n`;
    text += `〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰\n\n`;

    text += `resolve endpoint:\n\n`;

    text += `Number of requests today: ${stats.dataStats.today.NOR_today}\n\n`;

    text += `Number of requests yesterday: ${
      stats.dataStats.today.NOR_yesterday
    } (${stats.dataStats.today.NOR_yesterday_cpc}%) ${
      stats.dataStats.today.NOR_yesterday_cpc > 0 ? `💚` : `❤`
    }\n\n`;

    text += `Average number of requests in last 7 days: ${
      stats.dataStats.today.ANOR_thisWeek
    } (${stats.dataStats.today.ANOR_thisWeek_cpc}%) ${
      stats.dataStats.today.ANOR_thisWeek_cpc > 0 ? `💚` : `❤`
    }\n\n`;

    text += `Average number of requests in last 30 days: ${
      stats.dataStats.today.ANOR_thisMonth
    } (${stats.dataStats.today.ANOR_thisMonth_cpc}%) ${
      stats.dataStats.today.ANOR_thisMonth_cpc > 0 ? `💚` : `❤`
    }\n\n\n`;
  }

  if (stats.downloadStats) {
    text += `〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰\n\n`;

    text += `download endpoint:\n\n`;

    text += `Number of requests today: ${
      stats.downloadStats.today.NOR_today
    }\n\n`;

    text += `Number of requests yesterday: ${
      stats.downloadStats.today.NOR_yesterday
    } (${stats.downloadStats.today.NOR_yesterday_cpc}%) ${
      stats.downloadStats.today.NOR_yesterday_cpc > 0 ? `💚` : `❤`
    }\n\n`;

    text += `Average number of requests in last 7 days: ${
      stats.downloadStats.today.ANOR_thisWeek
    } (${stats.downloadStats.today.ANOR_thisWeek_cpc}%) ${
      stats.downloadStats.today.ANOR_thisWeek_cpc > 0 ? `💚` : `❤`
    }\n\n`;

    text += `Average number of requests in last 30 days: ${
      stats.downloadStats.today.ANOR_thisMonth
    } (${stats.downloadStats.today.ANOR_thisMonth_cpc}%) ${
      stats.downloadStats.today.ANOR_thisMonth_cpc > 0 ? `💚` : `❤`
    }\n\n\n`;
  }

  text += `〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰\n\nThank you! See you tomorrow. 👋`;

  return text;
}
