import fetch from 'node-fetch';
import fs from 'fs';
import https from 'https';
import { Headers } from 'node-fetch';
import { TIKTOK_USER_UID } from '../constants.js';

export default class Tiktok {
  async fetchLikedVideos() {
    const videos = []
    const fetchUrl = new URL('https://www.tiktok.com/api/favorite/item_list/');
    fetchUrl.search = new URLSearchParams({
      aid: '1988',
      count: 30,
      // user secret UID
      secUid: TIKTOK_USER_UID,
      cursor: 0,
    }).toString();
    
    //Fetches last 30 liked videos
    let response = await fetch(fetchUrl);
    response = await response.json();
    if (response.itemList && response.itemList.length > 0) {
      response.itemList.forEach(item => {
        videos.push({
          id: item.id,
          creator: item.author?.uniqueId,
        });
      });
      return videos;
    };
  };

  async downloadVideo(tiktokId) {
    const downloadUrl = await this.getDownloadUrl(tiktokId);
    const file = fs.createWriteStream(`${tiktokId}.mp4`);
    return new Promise((resolve) => {
      https.get(downloadUrl, (response) => {
        response.pipe(file);
        file.on('finish', function() {
          file.close();
          resolve();
        });
      });
    });
  };

  async getDownloadUrl(tiktokId) {
    const res = await this.getVideo(tiktokId);
    // include watermark if exists
    if (res.aweme_list[0].video.has_download_suffix_logo_addr) {
      return res.aweme_list[0].video.download_suffix_logo_addr.url_list[0];
    } else {
      return res.aweme_list[0].video.download_addr.url_list[0];
    };
  };

  async getVideo(tiktokId) {
    const url = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${tiktokId}`;
    const headers = new Headers();
    headers.append('User-Agent', 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet');
    const request = await fetch(url, { method: 'GET', headers : headers });
    const body = await request.text();
    return JSON.parse(body);
  };
};