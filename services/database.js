import pkg from 'pg';
import queries from '../queries.js';

const { Client } = pkg;

export default class Database {
  async init() {
    this.client = await this.openConnection();
    await this.client.query(queries.createTables); 
  };

  async openConnection() {
    const client = new Client();
    await client.connect();
    console.log('database connected');

    return client;
  };
  
  async closeConnection() {
    await this.client.end();
    
    console.log('database closed');
  };

  async startSession() {
    await this.client.query(queries.logsTable.insert);
    const res = await this.client.query(queries.logsTable.getLatest);
    this.currentSessionId = res.rows[0].id;
  };

  async markJobAsSuccessful() {
    const query = queries.logsTable.markAsSuccessful.replace('%session_id%', this.currentSessionId);
    await this.client.query(query);
  };

  async addVideo(videoObj) {
    const { id, creator } = videoObj;
    const insertQuery = queries.videosTable.insert.replace('%tiktok_id%', id).replace('%creator%', creator || '');
    await this.client.query(insertQuery);
  };

  async markVideoAsDownloaded(videoId) {
    this.updateVideoStatus(videoId, queries.videosTable.markAsDownloaded);
  };

  async markVideoAsPosted(videoId) {
    this.updateVideoStatus(videoId, queries.videosTable.markAsPosted);
  };

  async updateVideoStatus(id, query) {
    query = query.replace('%tiktok_id%', id);
    await this.client.query(query);
  };

  async getNextVideoToPost() {
    const res = await this.client.query(queries.videosTable.getLatest);
    if (res && res.rows.length > 0) {
      const record = res.rows[0];
      await this.client.query(queries.videosTable.markAsProcessing.replace('%tiktok_id%', record.tiktok_id));
      return {
        tiktokId: record.tiktok_id,
        creator: record.creator_username,
      };
    };
  };

  async logError(msg) {
    const query = queries.logsTable.error.replace('%msg%', msg).replace('session_id', this.currentSessionId);
    await this.client.query(query);
  };
};