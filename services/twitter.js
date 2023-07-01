import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

export default class Twitter {
  constructor() {
    dotenv.config();
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_APP_KEY,
      appSecret: process.env.TWITTER_APP_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });
  };

  async postVideo(videoId, creator) {
    // Post the video with caption: "🎥: creator_name"
    const mediaId = await this.client.v1.uploadMedia(`./${videoId}.mp4`);
    await this.client.v1.tweet(`🎥: ${creator}`, { media_ids: mediaId });
  };
};