const sql = require('mysql2/promise')
const dotenv = require("dotenv")
dotenv.config()



async function getConnection()  {
    const connection = sql.createConnection({
        host: process.env.HOST,
        user: process.env.NAME,      // Replace with your MySQL username
        password: process.env.PASSWORD,  // Replace with your MySQL password
        database: process.env.DATABASE,  // Replace with your database name
        // insecureAuth : true
    });
    return connection
}


// connection.connect(err => {
// if (err) {
//     return console.error('error connecting: ' + err.stack);
// }
// console.log("databse connected");})

module.exports = {getConnection}