const { chromium } = require("playwright-chromium");
const nodemailer = require("nodemailer");

const URL = "https://www.binance.com/en/support/announcement/c-48?navId=48";

const FILE_NAME = "binance.json";

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

//function to save objects to json file
const saveObjectsToJsonFile = async (objects, fileName) => {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, fileName);
  await fs.writeFile(filePath, JSON.stringify(objects), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
};

//function to get json file
const getJsonFile = async (fileName) => {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, fileName);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } else {
    return [];
  }
};

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

(async () => {
  const browser = await chromium.launch({ chromiumSandbox: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(URL);

  const jsonFile = await getJsonFile(FILE_NAME);

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

  const newItems = getNewItem(listToSave, jsonFile);

  await saveObjectsToJsonFile(listToSave, FILE_NAME);

  if (newItems.length > 0) {
    console.log("New items found!!!");
    await sendEmail(MAIL_USER, "New coins added to Binance", newItems);
  } else console.log("No new coins added to Binance");

  await browser.close();
})();
