// server.js
const express = require("express");
const next = require("next");
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { TwitterApi } = require("twitter-api-v2");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const prisma = new PrismaClient();
const handle = app.getRequestHandler();
console.log(process.env.APP_KEY)
const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

// Function to print data from the database
const printData = async () => {
  try {
    const data = await prisma.tweets.findMany({
      where: {
        posted: false,
        postedTime: {
          lte: new Date(),
        },
      },
    });
    if (data.length) {
      console.log(data);
      for (tweet of data) {
        console.log(tweet)
        await twitterClient.v2.tweet(tweet.tweet);
        console.log("Posted Tweet")
        await prisma.tweets.update({
          where: {
            id: tweet.id,
          },
          data: {
            posted: true,
          },
        });
        console.log("Waiting for next post, if exists")
        await new Promise((resolve) => setTimeout(resolve, 60000));
      }
    }
  } catch (error) {
    console.error("Error querying the database:", error);
  }
};

// Schedule a job to run every 15 seconds
const scheduleJob = () => {
  cron.schedule("*/2 * * * *", () => {
    printData();
  });
};

app.prepare().then(() => {
  const server = express();

  // Start the scheduled job
  scheduleJob();

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
