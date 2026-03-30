const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'monitoring_db',
  password: '7516',
  port: 5432,
});

module.exports = pool;