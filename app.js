import Database from './services/database.js';
import Tiktok from './services/tiktok.js';
import Twitter from './services/twitter.js';

import fs from 'fs';

const database = new Database();
await database.init();

database.startSession();
const tiktok = new Tiktok();
const twitter = new Twitter();
addNewVideos();
postNextVideo();
await database.markJobAsSuccessful();

process.exit();

async function addNewVideos() {
  const likedVideos = await tiktok.fetchLikedVideos();
  if (likedVideos) {
    likedVideos.forEach(videoObj => {
      database.addVideo(videoObj);
    });
  };
};

async function postNextVideo() {
  const videoObj = await database.getNextVideoToPost();

  if (videoObj && videoObj.tiktokId && videoObj.creator) {
    const { tiktokId, creator } = videoObj;
    await tiktok.downloadVideo(tiktokId);
    await database.markVideoAsDownloaded(tiktokId);

    await twitter.postVideo(tiktokId, creator);
    await database.markVideoAsPosted(tiktokId);

    fs.unlink(`./${tiktokId}.mp4`, () => {
      console.log('file deleted');
    });
  }
};
