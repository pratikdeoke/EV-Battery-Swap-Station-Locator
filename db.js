const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'evdb',
  password: 'pass',
  port: 5432,
});
module.exports = pool;