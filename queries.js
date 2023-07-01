import { VIDEO_STATUSES, LOG_STATUSES } from './constants.js';

const queries = {
  createTables: `CREATE TABLE IF NOT EXISTS logs (
    ID SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    status INT,
    error_message VARCHAR
  );

  CREATE TABLE IF NOT EXISTS videos (
    ID SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    posted_at TIMESTAMP,
    tiktok_id BIGINT UNIQUE,
    creator_username VARCHAR,
    status INT
  );`,
  videosTable: {
    insert: `INSERT INTO videos (tiktok_id, creator_username, status)
      VALUES (%tiktok_id%, '%creator%', ${VIDEO_STATUSES.added})
      ON CONFLICT DO NOTHING
    `,
    getLatest: 'SELECT * FROM videos WHERE posted_at IS NULL ORDER BY id DESC LIMIT 1',
    markAsDownloaded: `UPDATE videos
      SET status = '${VIDEO_STATUSES.downloaded}'
      WHERE tiktok_id = %tiktok_id%
    `,
    markAsPosted: `UPDATE videos
      SET status = '${VIDEO_STATUSES.posted}', posted_at = NOW()
      WHERE tiktok_id = %tiktok_id%
    `,
    markAsProcessing: `UPDATE videos
      SET status = '${VIDEO_STATUSES.processing}'
      WHERE tiktok_id = %tiktok_id%
    `,
  },
  logsTable: {
    insert: `INSERT INTO logs (status) VALUES (${LOG_STATUSES.started})`,
    getLatest: 'SELECT MAX(id) as id FROM logs',
    markAsSuccessful: `UPDATE logs
      SET status = '${LOG_STATUSES.success}'
      WHERE id = %session_id%
    `,
    error: `UPDATE logs
      SET status = '${LOG_STATUSES.error}', error_message = '%msg%'
      WHERE id = '%session_id%'
    `,
  }
};

export default queries;