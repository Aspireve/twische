// server.js
const express = require("express");
const next = require("next");
const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { default: axios } = require("axios");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const prisma = new PrismaClient();
const handle = app.getRequestHandler();

// KEYS
const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;

const endpointURL = `https://api.twitter.com/2/tweets`;
const requestTokenURL =
  "https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write";
const authorizeURL = new URL("https://api.twitter.com/oauth/authorize");
const accessTokenURL = "https://api.twitter.com/oauth/access_token";

const oauth = OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

async function input(prompt) {
  return new Promise(async (resolve, reject) => {
    readline.question(prompt, (out) => {
      readline.close();
      resolve(out);
    });
  });
}

async function requestToken() {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: requestTokenURL,
      method: "POST",
    })
  );

  const req = await got.post(requestTokenURL, {
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error("Cannot get an OAuth request token");
  }
}

async function accessToken({ oauth_token, oauth_token_secret }, verifier) {
  const authHeader = oauth.toHeader(
    oauth.authorize({
      url: accessTokenURL,
      method: "POST",
    })
  );
  const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;
  const req = await got.post(path, {
    headers: {
      Authorization: authHeader["Authorization"],
    },
  });
  if (req.body) {
    return qs.parse(req.body);
  } else {
    throw new Error("Cannot get an OAuth request token");
  }
}

async function getRequest({ oauth_token, oauth_token_secret }) {
  const token = {
    key: oauth_token,
    secret: oauth_token_secret,
  };

  const authHeader = oauth.toHeader(
    oauth.authorize(
      {
        url: endpointURL,
        method: "POST",
      },
      token
    )
  );

  const req = await got.post(endpointURL, {
    json: data,
    responseType: "json",
    headers: {
      Authorization: authHeader["Authorization"],
      "user-agent": "v2CreateTweetJS",
      "content-type": "application/json",
      accept: "application/json",
    },
  });
  if (req.body) {
    return req.body;
  } else {
    throw new Error("Unsuccessful request");
  }
}

let oAuthAccessToken = null

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
      if(!oAuthAccessToken) {
        const oAuthRequestToken = await requestToken();
        // Get authorization
        authorizeURL.searchParams.append(
          "oauth_token",
          oAuthRequestToken.oauth_token
        );
        console.log("Please go here and authorize:", authorizeURL.href);
        const pin = await input("Paste the PIN here: ");
        oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());
      }

      const postedData = await data.map(async (tweet) => {
        // get Access Token
      });
    }
    console.log("Data from database:", data);
  } catch (error) {
    console.error("Error querying the database:", error);
  }
};

// Schedule a job to run every 15 seconds
const scheduleJob = () => {
  cron.schedule("*/2 * * * *", () => {
    console.log("Running job to print data every 120 seconds...");
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

(async () => {
  try {
    // Get request token
    const oAuthRequestToken = await requestToken();
    // Get authorization
    authorizeURL.searchParams.append(
      "oauth_token",
      oAuthRequestToken.oauth_token
    );
    console.log("Please go here and authorize:", authorizeURL.href);
    const pin = await input("Paste the PIN here: ");
    // Get the access token
    const oAuthAccessToken = await accessToken(oAuthRequestToken, pin.trim());
    // Make the request
    const response = await getRequest(oAuthAccessToken);
    console.dir(response, {
      depth: null,
    });
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }
  process.exit();
})();
