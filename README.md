<h1 align="center">Welcome to coin-listing-tracker 👋</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <img alt="Node" src="https://img.shields.io/badge/node-%3E=12.18.1-blue" />
  <img alt="Npm" src="https://img.shields.io/badge/npm-%3E=6.14.5-blue" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green"/>
  <img alt="Axios" src="https://img.shields.io/badge/Axios-0.24.0-blue"/>
  <img alt="Mongodb" src="https://img.shields.io/badge/Mongodb-4.2.0-blue"/>
  <img alt="Nodemailer" src="https://img.shields.io/badge/Nodemailer-6.7.1-blue"/>
  <img alt="Nodemailer" src="https://img.shields.io/badge/Playwright-1.16.3-blue"/>
</p>

> Project to notify the new currencies listed in binance.

## Install

```sh
npm install
```

## Dependencies

Is necessary to create an account on [pushsafer](https://www.pushsafer.com/) to send push notifications on your cell phone

## Usage

```sh
npm run start
```

## Configure project

- Replace the **MAIL_USER** environment variable with your email
- Replace the **MAIL_PASS** environment variable with your email password
- Replace the **MONGO_CONNECTION_STRING** environment variable with your mongo database server
- Replace the **URL_PUSHSAFER** environment variable with your push safer url notification

## Deployment

> Example to deply in [Heroku](https://www.heroku.com/)

- First, create a new app on heroku
- Add the environment variables that were declared in the index file in the heroku app
- Then add next buildpacks
  - `https://github.com/mxschmitt/heroku-playwright-buildpack.git`
  - `heroku/nodejs`
- In the local project install package `npm i heroku -g`
- Run command `heroku login` and insert your credentials
- Run the next commands
  - `git init`
  - `git add .`
  - `git commit -am "first commit"`
  - `git push heroku master`
- Then you must install the following add-on in your heroku app
  - `Heroku Scheduler `
- Finally configures the job with next the command `node bin/index.js`

## Author

👤 **Rafael Rodriguez**

- GitHub: [@rrc011](https://github.com/rrc011)

---

## Show your support

Give a ⭐️ if this project helped you!
