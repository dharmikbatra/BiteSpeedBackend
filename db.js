const sql = require('mysql2/promise')



async function getConnection()  {
    const connection = sql.createConnection({
        host: 'sql12.freesqldatabase.com',
        user: 'sql12712806',      // Replace with your MySQL username
        password: 'jB79hjk3U6',  // Replace with your MySQL password
        database: 'sql12712806',  // Replace with your database name
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