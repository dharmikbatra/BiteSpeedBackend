const sql = require('mysql2/promise')
const dotenv = require("dotenv")
dotenv.config()



async function getConnection()  {
    const connection = sql.createConnection({
        host: process.env.HOST,
        user: process.env.NAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    });
    return connection
}

module.exports = {getConnection}