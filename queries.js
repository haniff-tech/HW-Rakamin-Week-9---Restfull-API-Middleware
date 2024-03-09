const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'RakaminWeek9',
    password: '992811',
    port: 5432,
})

module.exports = pool
