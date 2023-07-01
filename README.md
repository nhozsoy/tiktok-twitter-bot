A task I created to share TikTok videos I like on a Twitter account. I am using this as a cron job that runs periodically.

It checks the latest liked videos of a TikTok account, saves video ids, and post the latest unpublished video on Twitter.

### Usage
- Enter your Twitter developer account credentials as environment variables.
- Create and run a PostgreSQL database, and enter the database information as environment variables.
- Enter the TikTok account's user UID in `constants.js` file.
- Run the following commands:
```
  npm install
  node app.js
```
