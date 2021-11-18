const { chromium } = require("playwright-chromium");
const nodemailer = require("nodemailer");
const axios = require("axios");
const mongo = require("mongodb").MongoClient;

const URL = "https://www.binance.com/en/support/announcement/c-48?navId=48";

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;

//function to return new item from two arrays
const getNewItem = (array1, array2) => {
  const results = array1.filter(
    ({ textValue: id1 }) => !array2.some(({ textValue: id2 }) => id2 === id1)
  );
  return results;
};

//function to send email
const sendEmail = async (email, subject, newCoins) => {
  let emailTemplate = `<h1>New coins added to Binance</h1>
    <ul>
        ${newCoins
          .map(
            (coin) =>
              `<li>${coin.textValue} - <a href="${coin.hrefValue}">Ir a</a></li>`
          )
          .join("")}
    </ul>`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });
  const mailOptions = {
    from: MAIL_USER,
    to: email,
    subject: subject,
    html: emailTemplate,
  };
  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const sendPushNotification = async (newCoins) => {
  let url = `https://www.pushsafer.com/api?k=1sx8b3BnfMzsM6LiLIYA&s=11&v=1&t=New%20coins%20added%20to%20Binance&m=${newCoins
    .map((coin) => `${coin.textValue}`)
    .join("\n")}`;

  axios.get(url, (res) => {
    console.log(res);
  });
};

const saveCoinsToMongo = async (coins) => {
  const client = await mongo.connect(MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
  });
  const db = client.db("new-coin-listing");
  const collection = db.collection("coins");
  await collection.insertMany(coins);
  console.log("coins saved to mongo");
  client.close();
};

const getCoinsFromMongo = async () => {
  const client = await mongo.connect(MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
  });
  const db = client.db("new-coin-listing");
  const collection = db.collection("coins");
  const coins = await collection.find({}).toArray();
  client.close();
  return coins;
};

(async () => {
  const browser = await chromium.launch({ chromiumSandbox: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);

  const coinsSaved = await getCoinsFromMongo();

  const links = await page.$$("a:Text('Binance Will List')");
  let listToSave = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const href = await link.getProperty("href");
    const hrefValue = await href.jsonValue();
    const text = await link.getProperty("textContent");

    const textValue = await text.jsonValue();
    listToSave.push({ hrefValue, textValue });
  }

  const newItems = getNewItem(listToSave, coinsSaved);

  console.log({ newItems });

  if (newItems.length > 0) await saveCoinsToMongo(newItems);

  if (newItems.length > 0) {
    console.log("New items found!!!");
    await sendEmail(MAIL_USER, "New coins added to Binance", newItems);
    await sendPushNotification(newItems);
  } else console.log("No new coins added to Binance");

  await browser.close();
})();
